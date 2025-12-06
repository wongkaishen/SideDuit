import os
import json
import google.generativeai as genai
import psycopg2
from datetime import datetime
from django.conf import settings
from PIL import Image
import io
from .db_pool import get_db_connection, release_db_connection

# Configure Gemini
def get_gemini_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash-exp')

def get_embedding_model():
    """Get Gemini embedding model for RAG"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=api_key)
    return 'models/text-embedding-004'  # Latest embedding model

def process_document(file_obj, filename):
    """
    Process a single file using Gemini to extract enhanced transaction data.
    Returns a list of transaction dictionaries with detailed information.
    """
    model = get_gemini_model()
    
    # Read file content
    content = file_obj.read()
    
    # Determine mime type
    mime_type = "image/jpeg"  # Default
    if filename.lower().endswith('.png'):
        mime_type = "image/png"
    elif filename.lower().endswith('.pdf'):
        mime_type = "application/pdf"
    elif filename.lower().endswith('.jpg') or filename.lower().endswith('.jpeg'):
        mime_type = "image/jpeg"
    elif filename.lower().endswith('.webp'):
        mime_type = "image/webp"
    
    # Enhanced prompt for better extraction
    prompt = """
    Analyze this financial document (receipt, invoice, bill, payslip, or statement). 
    Extract all transactions with detailed information.
    
    Return ONLY a raw JSON array. Do not include markdown formatting like ```json ... ```.
    
    IMPORTANT DATE FORMAT RULES:
    - Input dates in the document use BRITISH/UK format: DD/MM/YYYY
    - Example: "5/12/2025" means 5th December 2025, NOT May 12th
    - Example: "31/01/2024" means 31st January 2024, NOT invalid date
    - Always convert to ISO format YYYY-MM-DD in your response
    - If year is ambiguous, use current year (2024/2025)
    
    Each transaction object should have:
    {
      "year": 2024,  // integer, extracted from date
      "date": "YYYY-MM-DD",  // required, converted from DD/MM/YYYY format in document
      "time": "HH:MM:SS",  // or null if not found
      "transaction_type": "Income" or "Expense",  // Required
      "transaction_amount": 123.45,  // number with decimals
      "category": "specific category",  // e.g. "Food-Restaurant", "Transport-Ride", "Income-Freelance", "Utilities-Phone"
      "merchant_name": "Business name",  // Name of merchant/company, or null
      "description": "Brief description",  // What was bought/earned, e.g. "Lunch at McDonald's" or "Grab ride to office"
      "items": ["item1", "item2"],  // List of items if visible, or empty array
      "confidence": 0.95  // Your confidence in this extraction (0.0 to 1.0)
    }
    
    Classification rules:
    - Receipts/Bills = "Expense"
    - Invoices you're sending = "Income"
    - Payslips/Salary = "Income"
    - Bank statements: extract individual transactions
    
    Category examples:
    Expenses: "Food-Restaurant", "Food-Groceries", "Transport-Ride", "Transport-Fuel", 
              "Utilities-Phone", "Utilities-Electric", "Shopping-Clothing", "Entertainment-Movie"
    Income: "Income-Salary", "Income-Freelance", "Income-Gig", "Income-Business"
    
    Be specific with categories. Infer from context.
    """
    
    try:
        parts = [prompt]
        
        if mime_type.startswith('image/'):
            image = Image.open(io.BytesIO(content))
            parts.append(image)
        else:
            # PDF support
            parts.append({
                "mime_type": mime_type,
                "data": content
            })

        response = model.generate_content(parts)
        
        # Parse JSON
        text_response = response.text.strip()
        # Clean up markdown code blocks
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.startswith("```"):
            text_response = text_response[3:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
        text_response = text_response.strip()
            
        transactions = json.loads(text_response)
        
        # Add document metadata to each transaction
        for t in transactions:
            t['document_id'] = filename
            t['original_text'] = text_response  # Store for embedding
            
        return transactions
        
    except Exception as e:
        print(f"Error processing {filename}: {e}")
        return []

def generate_embedding(text):
    """
    Generate vector embedding using Gemini text-embedding-004 model.
    Returns a list of floats representing the embedding vector.
    """
    try:
        embedding_model = get_embedding_model()
        result = genai.embed_content(
            model=embedding_model,
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def save_transactions_to_supabase(transactions, user_id=None, upload_id=None):
    """
    Insert transactions into Supabase with enhanced data.
    Also generates and stores embeddings for RAG.
    
    Args:
        transactions: List of enhanced transaction dictionaries
        user_id: Optional user ID
        upload_id: ID from update_logs table
    
    Returns:
        Number of transactions inserted
    """
    if not transactions:
        return 0
    
    conn = None
    count = 0
    transaction_ids = []
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insert transaction query
        insert_query = """
        INSERT INTO public.transactions 
        (date, time, transaction_type, transaction_amount, upload_id, user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        
        final_user_id = str(user_id) if user_id is not None else '0'
        
        # Insert transactions and collect IDs
        for t in transactions:
            cur.execute(insert_query, (
                t.get('date'),
                t.get('time'),
                t.get('transaction_type'),
                t.get('transaction_amount'),
                upload_id,
                final_user_id
            ))
            
            transaction_id = cur.fetchone()[0]
            transaction_ids.append((transaction_id, t))
            count += 1
        
        conn.commit()
        
        # Generate and store embeddings asynchronously
        save_embeddings_for_transactions(transaction_ids, upload_id, final_user_id, cur, conn)
        
        cur.close()
        
    except Exception as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            release_db_connection(conn)
            
    return count

def save_embeddings_for_transactions(transaction_data, upload_id, user_id, cursor, connection):
    """
    Generate and save embeddings for transactions.
    
    Args:
        transaction_data: List of tuples (transaction_id, transaction_dict)
        upload_id: Upload ID
        user_id: User ID
        cursor: Database cursor
        connection: Database connection
    """
    embedding_query = """
    INSERT INTO public.transaction_embeddings
    (transaction_id, upload_id, original_text, document_name, document_type,
     embedding, transaction_category, merchant_name, amount, transaction_date,
     classification_confidence, user_id)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    for transaction_id, trans_dict in transaction_data:
        try:
            # Create rich text representation for embedding
            text_for_embedding = create_embedding_text(trans_dict)
            
            # Generate embedding
            embedding = generate_embedding(text_for_embedding)
            
            if embedding is None:
                print(f"Skipping embedding for transaction {transaction_id} - generation failed")
                continue
            
            # Determine document type
            doc_type = infer_document_type(trans_dict)
            
            # Execute insert
            cursor.execute(embedding_query, (
                transaction_id,
                upload_id,
                text_for_embedding,
                trans_dict.get('document_id'),
                doc_type,
                embedding,  # pgvector will handle the array
                trans_dict.get('category'),
                trans_dict.get('merchant_name'),
                trans_dict.get('transaction_amount'),
                trans_dict.get('date'),
                trans_dict.get('confidence', 0.5),
                user_id
            ))
            
        except Exception as e:
            print(f"Error saving embedding for transaction {transaction_id}: {e}")
            # Continue with other embeddings even if one fails
            continue
    
    connection.commit()

def create_embedding_text(transaction):
    """
    Create a rich text representation of the transaction for embedding.
    This text will be used for semantic search and RAG.
    """
    parts = []
    
    # Transaction type and amount
    parts.append(f"{transaction.get('transaction_type', '')} of RM {transaction.get('transaction_amount', 0)}")
    
    # Date
    if transaction.get('date'):
        parts.append(f"on {transaction.get('date')}")
    
    # Merchant
    if transaction.get('merchant_name'):
        parts.append(f"at {transaction.get('merchant_name')}")
    
    # Category
    if transaction.get('category'):
        parts.append(f"Category: {transaction.get('category')}")
    
    # Description
    if transaction.get('description'):
        parts.append(f"Description: {transaction.get('description')}")
    
    # Items
    if transaction.get('items') and len(transaction.get('items', [])) > 0:
        items_str = ", ".join(transaction.get('items', []))
        parts.append(f"Items: {items_str}")
    
    return ". ".join(parts)

def infer_document_type(transaction):
    """Infer document type from transaction data"""
    category = transaction.get('category', '').lower()
    merchant = transaction.get('merchant_name', '').lower()
    
    if 'salary' in category or 'payslip' in category:
        return 'payslip'
    elif 'invoice' in category or transaction.get('transaction_type') == 'Income':
        return 'invoice'
    elif any(word in merchant for word in ['grab', 'foodpanda', 'gojek']):
        return 'gig_receipt'
    elif any(word in category for word in ['food', 'restaurant']):
        return 'receipt'
    elif 'bill' in category:
        return 'bill'
    else:
        return 'receipt'

def log_upload(file_obj, filename, user_id=None):
    """
    Log the upload event and save the file blob to update_logs table.
    Returns upload_id or None on failure.
    """
    conn = None
    try:
        # Reset file pointer to beginning to read content
        file_obj.seek(0)
        content = file_obj.read()
        # Reset again for subsequent processing
        file_obj.seek(0)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        insert_query = """
        INSERT INTO public.update_logs 
        (upload_user, upload_document_name, uploaded_document)
        VALUES (%s, %s, %s)
        RETURNING upload_id
        """
        
        final_user_id = str(user_id) if user_id is not None else '0'
        
        cur.execute(insert_query, (
            final_user_id,
            filename,
            psycopg2.Binary(content)
        ))
        
        upload_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        print(f"✅ Logged upload for {filename} with ID {upload_id}")
        return upload_id
        
    except Exception as e:
        print(f"❌ Error logging upload for {filename}: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            release_db_connection(conn)

def chat_with_retirement_advisor(user_profile, chat_history):
    """
    Generate retirement advice using Gemini with chat history.
    """
    model = get_gemini_model()
    
    # Construct history for Gemini
    history = []
    
    # System instruction as the first part of the context
    system_prompt = f"""
    You are a friendly financial helper for a gig worker in Malaysia.
    
    User Profile:
    - Current Age: {user_profile.get('age')}
    - Retirement Age: {user_profile.get('retirement_age')}
    - Current EPF Savings: RM {user_profile.get('current_savings')}
    - Monthly Contribution: RM {user_profile.get('monthly_contribution')}
    
    Instructions:
    - Explain simply, like talking to a friend. Avoid big financial words.
    - Keep it SHORT and easy to read.
    - Focus on what the numbers mean for their future.
    
    Formatting Rules (STRICT):
    - Use bullet points.
    - Do NOT use bold text.
    - Use emojis sparingly (max 1 per point).
    """
    
    # Add system prompt to history (Gemini 1.5 Pro/Flash supports system instructions, 
    # but for simple chat history construction with `start_chat`, we can just prepend it or use it as context)
    # Ideally we use system_instruction in GenerativeModel, but let's stick to a simple prompt injection for now.
    
    # Convert chat_history to Gemini format
    # chat_history is expected to be list of {'role': 'user'|'model', 'parts': ['text']}
    gemini_history = []
    
    # Add system context to the first user message or as a separate turn if needed.
    # A simple way is to prepend the system prompt to the latest message if history is empty,
    # or rely on the model to understand context from the conversation.
    
    if not chat_history:
        # First message from user (implied trigger)
        initial_prompt = f"{system_prompt}\n\nPlease analyze my retirement plan."
        try:
            response = model.generate_content(initial_prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error generating advice: {e}")
            return "Unable to generate advice at this time."
            
    else:
        # Existing history
        # We need to format it for start_chat
        # Note: 'system' role is not standard in chat history for `start_chat` usually, 
        # so we might just prepend context to the first message if we were rebuilding it,
        # but here we just want to generate the NEXT response.
        
        # We will use `generate_content` with a constructed prompt of the whole conversation 
        # OR use `start_chat`. `start_chat` is cleaner.
        
        formatted_history = []
        # Prepend system prompt to the first message effectively by starting the chat with it?
        # Actually, let's just use `start_chat` and send the system prompt as the first 'user' message if history is empty,
        # but since we are stateless here, we rebuild the history.
        
        # Hack: Add system prompt as a "user" message at the start, followed by a "model" acknowledgement?
        # Or just prepend it to the first user message.
        
        for i, msg in enumerate(chat_history):
            role = 'user' if msg['role'] == 'user' else 'model'
            text = msg['content']
            if i == 0 and role == 'user':
                text = system_prompt + "\n\n" + text
            formatted_history.append({'role': role, 'parts': [text]})
            
        chat = model.start_chat(history=formatted_history)
        
        # The last message in chat_history should be the user's new input
        # But wait, the view usually sends the *whole* history including the new message?
        # Or the view sends history + new message.
        # Let's assume the view sends the full list including the latest user message.
        # So we need to pop the last message to send it to `send_message`.
        
        last_message = formatted_history.pop()
        if last_message['role'] != 'user':
            # Should not happen if logic is correct
            return "Error: Last message was not from user."
            
        # Re-init chat with previous history
        chat = model.start_chat(history=formatted_history)
        
        try:
            response = chat.send_message(last_message['parts'][0])
            return response.text.strip()
        except Exception as e:
            print(f"Error generating chat response: {e}")
            return "Unable to generate response."
