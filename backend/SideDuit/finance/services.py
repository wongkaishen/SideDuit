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
    return genai.GenerativeModel('gemini-2.5-flash')

def process_document(file_obj, filename):
    """
    Process a single file using Gemini to extract transaction data.
    Returns a list of transaction dictionaries.
    """
    model = get_gemini_model()
    
    # Read file content
    content = file_obj.read()
    
    # Determine mime type (basic check)
    mime_type = "image/jpeg" # Default
    if filename.lower().endswith('.png'):
        mime_type = "image/png"
    elif filename.lower().endswith('.pdf'):
        mime_type = "application/pdf"
    # Add more types if needed
    
    # Prepare the prompt
    prompt = """
    Analyze this financial document (receipt or invoice). 
    Extract all transactions found.
    Return ONLY a raw JSON array of objects. Do not include markdown formatting like ```json ... ```.
    Each object should have the following fields:
    - year (integer, e.g. 2023)
    - date (string, YYYY-MM-DD)
    - time (string, HH:MM:SS, or null if not found)
    - transaction_type (string, either "Income" or "Expense". Receipts/Bills are usually "Expense". Payslips/Invoices sent are "Income".)
    - category (string, e.g. "Food", "Transport", "Groceries", "Utilities", etc. Infer based on items)
    - transaction_amount (number, decimal)
    
    If the year is missing, infer it from the date.
    """
    
    try:
        # Create a Part object for the file
        # For Gemini API, we can pass the bytes directly if we use the right method, 
        # or we might need to upload it if it's large. For simple images, passing PIL image or bytes works.
        # simpler approach for images:
        
        parts = [prompt]
        
        if mime_type.startswith('image/'):
            image = Image.open(io.BytesIO(content))
            parts.append(image)
        else:
            # For PDF, we might need to use the File API or extract text. 
            # Gemini 1.5 Flash supports PDF via the File API.
            # For this hackathon, let's assume images for simplicity or handle PDF via text extraction if needed.
            # But Gemini 1.5 supports PDF input directly via the API if uploaded.
            # To keep it simple and stateless without uploading to Google's file storage if possible:
            # Actually, passing bytes for PDF is not directly supported in `generate_content` without uploading.
            # We will stick to images for the inline method, or warn if PDF.
            # Let's try to support PDF by just passing the bytes object with mime_type if the SDK supports it (newer versions do).
            
            parts.append({
                "mime_type": mime_type,
                "data": content
            })

        response = model.generate_content(parts)
        
        # Parse JSON
        text_response = response.text.strip()
        # Clean up markdown code blocks if present (despite prompt)
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
            
        transactions = json.loads(text_response)
        
        # Add document_id to each transaction
        for t in transactions:
            t['document_id'] = filename
            
        return transactions
        
    except Exception as e:
        print(f"Error processing {filename}: {e}")
        return []

def save_transactions_to_supabase(transactions, user_id=None, upload_id=None):
    """
    Insert transactions into Supabase table with connection pooling.
    
    Args:
        transactions: List of transaction dictionaries
        user_id: Optional user ID for multi-tenant isolation
        upload_id: ID from update_logs table
    
    Returns:
        Number of transactions inserted
    """
    if not transactions:
        return 0
    
    conn = None
    count = 0
    try:
        # Get connection from pool instead of creating new one
        conn = get_db_connection()
        cur = conn.cursor()
        
        insert_query = """
        INSERT INTO public.transactions 
        (date, time, transaction_type, transaction_amount, upload_id, user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        # Default user_id to '0' if not provided, matching the schema default
        final_user_id = str(user_id) if user_id is not None else '0'
        
        for t in transactions:
            cur.execute(insert_query, (
                t.get('date'),
                t.get('time'),
                t.get('transaction_type'),
                t.get('transaction_amount'),
                upload_id,  # Link to update_logs
                final_user_id
            ))
            count += 1
            
        conn.commit()
        cur.close()
        
    except Exception as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            # Return connection to pool instead of closing
            release_db_connection(conn)
            
    return count

def log_upload(file_obj, filename, user_id=None):
    """
    Log the upload event and save the file blob to update_logs table.
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
        
        # Default user_id to '0' if not provided
        final_user_id = str(user_id) if user_id is not None else '0'
        
        cur.execute(insert_query, (
            final_user_id,
            filename,
            psycopg2.Binary(content)
        ))
        
        upload_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        print(f"Logged upload for {filename} with ID {upload_id}")
        return upload_id
        
    except Exception as e:
        print(f"Error logging upload for {filename}: {e}")
        if conn:
            conn.rollback()
        # We don't raise here to avoid blocking, but return None
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
