from flask import Flask, render_template, request, send_file, session
import pandas as pd
import os
from io import BytesIO
import secrets

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
app.config['SECRET_KEY'] = secrets.token_hex(16)  # Required for session management

# Create uploads folder if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part", 400
    
    file = request.files['file']
    
    if file.filename == '':
        return "No selected file", 400
    
    if file:
        try:
            # Read the CSV file
            df = pd.read_csv(file)
            
            # Identify duplicates across all columns
            # keep=False marks all duplicates as True (including the first occurrence)
            duplicates = df[df.duplicated(keep=False)]
            
            # Store duplicate data in a temporary file for later download
            has_duplicates = not duplicates.empty
            
            if has_duplicates:
                # Create a unique filename for this session's duplicates
                duplicate_filename = f"duplicates_{secrets.token_hex(8)}.csv"
                duplicate_filepath = os.path.join(app.config['UPLOAD_FOLDER'], duplicate_filename)
                
                # Save duplicates to temporary file
                duplicates.to_csv(duplicate_filepath, index=False)
                
                # Store the filename in session for later retrieval
                session['duplicate_file'] = duplicate_filepath
            
            # Convert DataFrames to HTML tables for display
            original_html = df.to_html(classes='table table-striped', index=False)
            duplicate_html = duplicates.to_html(classes='table table-striped', index=False) if has_duplicates else None
            
            return render_template('results.html',
                                 original_data=original_html,
                                 duplicate_data=duplicate_html,
                                 has_duplicates=has_duplicates,
                                 original_count=len(df),
                                 duplicate_count=len(duplicates))
        
        except Exception as e:
            return f"Error processing file: {str(e)}", 500
    
    return "Something went wrong", 500

@app.route('/download_duplicates', methods=['GET'])
def download_duplicates():
    try:
        # Retrieve the duplicate file path from session
        duplicate_filepath = session.get('duplicate_file')
        
        if not duplicate_filepath or not os.path.exists(duplicate_filepath):
            return "No duplicate data available for download. Please upload a CSV file first.", 404
        
        # Send the file to the user
        return send_file(
            duplicate_filepath,
            mimetype='text/csv',
            as_attachment=True,
            download_name='duplicates.csv'
        )
    
    except Exception as e:
        return f"Error downloading file: {str(e)}", 500

@app.route('/cleanup', methods=['POST'])
def cleanup():
    """Clean up temporary files after download (optional route)"""
    try:
        duplicate_filepath = session.get('duplicate_file')
        
        if duplicate_filepath and os.path.exists(duplicate_filepath):
            os.remove(duplicate_filepath)
            session.pop('duplicate_file', None)
        
        return "Cleanup successful", 200
    
    except Exception as e:
        return f"Error during cleanup: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True)

