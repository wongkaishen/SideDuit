import os
import json
import google.generativeai as genai
import psycopg2
from datetime import datetime
from django.conf import settings
from PIL import Image
import io

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
    - transaction_type (string, e.g. "Food", "Transport", "Groceries", "Utilities", etc. Infer based on items)
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

def save_transactions_to_supabase(transactions):
    """
    Insert transactions into Supabase table.
    """
    if not transactions:
        return 0
        
    # Connection params
    # postgres://postgres:[YOUR_PASSWORD]@db.owlqezrqhwnhviwirsvs.supabase.co:5432/postgres
    if not db_password:
        raise ValueError("SUPABASE_DB_PASSWORD environment variable not set")
        
    host = os.getenv("SUPABASE_DB_HOST", "db.owlqezrqhwnhviwirsvs.supabase.co")
    port = "5432"
    port = "5432"
    dbname = "postgres"
    user = "postgres"
    
    conn = None
    count = 0
    try:
        conn = psycopg2.connect(
            host=host,
            database=dbname,
            user=user,
            password=db_password,
            port=port
        )
        cur = conn.cursor()
        
        insert_query = """
        INSERT INTO public.transactions 
        (year, date, time, transaction_type, transaction_amount, document_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        for t in transactions:
            cur.execute(insert_query, (
                t.get('year'),
                t.get('date'),
                t.get('time'),
                t.get('transaction_type'),
                t.get('transaction_amount'),
                t.get('document_id')
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
            conn.close()
            
    return count
