from django.shortcuts import render
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .services import process_document, save_transactions_to_supabase

def upload_view(request):
    """
    Handle file upload and processing.
    
    For multi-user apps, add @login_required decorator and pass request.user.id
    """
    if request.method == 'POST':
        files = request.FILES.getlist('documents')
        
        if not files:
            messages.error(request, "No files selected.")
            return render(request, 'finance/upload.html')
            
        total_processed = 0
        errors = []
        
        # Get user_id if authenticated, otherwise None for testing
        user_id = request.user.id if request.user.is_authenticated else None
        
        for f in files:
            try:
                # Process with LLM
                transactions = process_document(f, f.name)
                
                # Save to DB with user_id for isolation
                if transactions:
                    count = save_transactions_to_supabase(transactions, user_id=user_id)
                    total_processed += count
                else:
                    errors.append(f"{f.name}: No transactions found or parsing failed.")
                    
            except Exception as e:
                errors.append(f"{f.name}: {str(e)}")
        
        if total_processed > 0:
            messages.success(request, f"Successfully processed {total_processed} transactions.")
        
        if errors:
            for err in errors:
                messages.error(request, err)
                
    return render(request, 'finance/upload.html')
