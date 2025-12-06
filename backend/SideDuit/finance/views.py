from django.shortcuts import render
from django.contrib import messages
from .services import process_document, save_transactions_to_supabase

def upload_view(request):
    if request.method == 'POST':
        files = request.FILES.getlist('documents')
        
        if not files:
            messages.error(request, "No files selected.")
            return render(request, 'finance/upload.html')
            
        total_processed = 0
        errors = []
        
        for f in files:
            try:
                # Process with LLM
                transactions = process_document(f, f.name)
                
                # Save to DB
                if transactions:
                    count = save_transactions_to_supabase(transactions)
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
