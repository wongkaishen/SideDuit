"""
RAG (Retrieval Augmented Generation) module for intelligent financial chat
Uses vector embeddings for semantic search and Gemini for response generation
"""

import os
import google.generativeai as genai
from .db_pool import get_db_connection, release_db_connection
from .services import generate_embedding


def get_gemini_chat_model():
    """Get Gemini model for chat responses"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash-exp')


def semantic_search_transactions(query_text, user_id=None, top_k=10):
    """
    Perform semantic search on transaction embeddings.
    
    Args:
        query_text: User's query
        user_id: Optional user filter
        top_k: Number of results to return
    
    Returns:
        List of relevant transactions with similarity scores
    """
    conn = None
    try:
        # Generate embedding for the query
        query_embedding = generate_embedding(query_text)
        
        if query_embedding is None:
            return []
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Semantic search using cosine similarity
        # Note: <=> is the cosine distance operator in pgvector
        # Lower distance = higher similarity
        query = """
        SELECT 
            te.transaction_id,
            te.original_text,
            te.merchant_name,
            te.transaction_category,
            te.amount,
            te.transaction_date,
            te.document_name,
            te.document_type,
            t.transaction_type,
            t.time,
            (1 - (te.embedding <=> %s::vector)) as similarity_score
        FROM public.transaction_embeddings te
        JOIN public.transactions t ON te.transaction_id = t.id
        WHERE 1=1
        """
        
        params = [query_embedding]
        
        if user_id:
            query += " AND te.user_id = %s"
            params.append(user_id)
        
        query += """
        ORDER BY te.embedding <=> %s::vector
        LIMIT %s
        """
        params.append(query_embedding)
        params.append(top_k)
        
        cur.execute(query, params)
        results = cur.fetchall()
        
        # Format results
        transactions = []
        for row in results:
            transactions.append({
                'transaction_id': row[0],
                'original_text': row[1],
                'merchant_name': row[2],
                'category': row[3],
                'amount': float(row[4]) if row[4] else 0.0,
                'date': row[5].strftime('%Y-%m-%d') if row[5] else None,
                'document_name': row[6],
                'document_type': row[7],
                'transaction_type': row[8],
                'time': row[9].strftime('%H:%M:%S') if row[9] else None,
                'similarity_score': float(row[10])
            })
        
        cur.close()
        return transactions
        
    except Exception as e:
        print(f"Error in semantic search: {e}")
        # Fallback to basic keyword search if embeddings fail
        return fallback_keyword_search(query_text, user_id, top_k)
    
    finally:
        if conn:
            release_db_connection(conn)


def fallback_keyword_search(query_text, user_id=None, top_k=10):
    """
    Fallback to basic keyword search if vector search fails.
    Used when transaction_embeddings table doesn't exist or has no data.
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Simple keyword search on transactions
        query = """
        SELECT 
            t.id as transaction_id,
            t.transaction_type,
            t.transaction_amount,
            t.date,
            t.time,
            t.document_id
        FROM public.transactions t
        WHERE 1=1
        """
        
        params = []
        
        # Add keyword matching (case-insensitive)
        if query_text:
            keywords = query_text.lower().split()
            keyword_conditions = []
            for keyword in keywords[:3]:  # Limit to first 3 keywords
                keyword_conditions.append("LOWER(t.transaction_type) LIKE %s")
                params.append(f"%{keyword}%")
            
            if keyword_conditions:
                query += " AND (" + " OR ".join(keyword_conditions) + ")"
        
        if user_id:
            query += " AND t.user_id = %s"
            params.append(user_id)
        
        query += " ORDER BY t.created_at DESC LIMIT %s"
        params.append(top_k)
        
        cur.execute(query, params)
        results = cur.fetchall()
        
        transactions = []
        for row in results:
            transactions.append({
                'transaction_id': row[0],
                'transaction_type': row[1],
                'amount': float(row[2]) if row[2] else 0.0,
                'date': row[3].strftime('%Y-%m-%d') if row[3] else None,
                'time': row[4].strftime('%H:%M:%S') if row[4] else None,
                'document_name': row[5],
                'similarity_score': 0.5  # Default score for keyword match
            })
        
        cur.close()
        return transactions
        
    except Exception as e:
        print(f"Error in fallback search: {e}")
        return []
    
    finally:
        if conn:
            release_db_connection(conn)


def generate_rag_response(query, user_id=None):
    """
    Generate AI response using RAG (Retrieval Augmented Generation).
    
    Args:
        query: User's question
        user_id: Optional user filter
    
    Returns:
        dict with 'response' and 'sources'
    """
    try:
        # Step 1: Retrieve relevant transactions
        relevant_transactions = semantic_search_transactions(query, user_id, top_k=10)
        
        if not relevant_transactions:
            return {
                'response': "I couldn't find any relevant transactions to answer your question. Try uploading some receipts or invoices first!",
                'sources': []
            }
        
        # Step 2: Build context from retrieved transactions
        context_parts = []
        for i, txn in enumerate(relevant_transactions, 1):
            context_parts.append(f"""
Transaction {i}:
- Type: {txn.get('transaction_type', 'Unknown')}
- Amount: RM {txn.get('amount', 0):.2f}
- Date: {txn.get('date', 'Unknown')}
- Category: {txn.get('category', 'N/A')}
- Merchant: {txn.get('merchant_name', 'N/A')}
- Document: {txn.get('document_name', 'N/A')}
- Details: {txn.get('original_text', 'N/A')}
- Relevance Score: {txn.get('similarity_score', 0):.2f}
""")
        
        context = "\n".join(context_parts)
        
        # Step 3: Create prompt for Gemini
        prompt = f"""
You are SideDuit AI, a helpful financial assistant for gig economy workers in Malaysia.

User Question: {query}

Relevant Transaction Data:
{context}

Instructions:
1. Answer the user's question based ONLY on the transaction data provided above
2. Be specific and cite actual amounts, dates, and merchants when relevant
3. If the data doesn't fully answer the question, say so
4. Use Malaysian Ringgit (RM) for currency
5. Be conversational and helpful, like a friendly financial advisor
6. Keep responses concise (2-3 paragraphs max)
7. If asked about trends, calculate totals and percentages from the data
8. For tax questions, remind that these are estimates (consult a tax professional)

Your response:
"""
        
        # Step 4: Generate response with Gemini
        model = get_gemini_chat_model()
        response = model.generate_content(prompt)
        
        # Step 5: Format sources for citation
        sources = []
        for txn in relevant_transactions[:5]:  # Top 5 sources
            sources.append({
                'transaction_id': txn.get('transaction_id'),
                'merchant': txn.get('merchant_name') or txn.get('document_name', 'Unknown'),
                'amount': txn.get('amount', 0),
                'date': txn.get('date'),
                'category': txn.get('category'),
                'similarity': round(txn.get('similarity_score', 0) * 100, 1)
            })
        
        return {
            'response': response.text,
            'sources': sources,
            'total_sources': len(relevant_transactions)
        }
        
    except Exception as e:
        print(f"Error generating RAG response: {e}")
        return {
            'response': f"Sorry, I encountered an error: {str(e)}. Please try again.",
            'sources': [],
            'error': str(e)
        }

