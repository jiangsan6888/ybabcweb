# CSV Duplicate Finder

A Flask web application that identifies and extracts duplicate rows from CSV files.

## Features

- 📤 Upload CSV files (up to 16MB)
- 🔍 Automatically detect duplicate rows based on all columns
- 📊 View original data and duplicate rows side-by-side
- 📥 Download identified duplicates as a separate CSV file
- 🎨 Modern, responsive UI with statistics

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Run the Flask application:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

3. Upload a CSV file using the web interface

4. View the results:
   - Original data table
   - Duplicate rows table (if any found)
   - Statistics (total rows, duplicates, unique rows)

5. Download the duplicate rows as a CSV file (if duplicates exist)

## How It Works

### Duplicate Detection
The application uses pandas' `duplicated(keep=False)` method to identify duplicate rows. This marks ALL occurrences of duplicate rows as True, including the first occurrence. For example:

If your CSV contains:
```
Name,Age,City
John,25,NYC
Jane,30,LA
John,25,NYC
```

The duplicates DataFrame will contain both "John,25,NYC" rows (rows 1 and 3).

### File Storage
- Uploaded files are processed in memory
- Duplicate rows are temporarily saved to the `uploads/` folder
- The filename is stored in the Flask session for download retrieval
- Files can be cleaned up using the cleanup endpoint (optional)

## Project Structure

```
.
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   ├── index.html        # Upload page
│   └── results.html      # Results display page
└── uploads/              # Temporary storage for duplicate CSVs (created automatically)
```

## Technical Details

- **Framework**: Flask
- **Data Processing**: pandas
- **File Handling**: Temporary file storage with session management
- **UI**: Bootstrap 4 with custom styling
- **Max File Size**: 16MB (configurable in `app.py`)

## Configuration

You can modify the following settings in `app.py`:

```python
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Maximum upload size
app.config['UPLOAD_FOLDER'] = 'uploads'               # Temporary storage location
```

## Security Considerations

- The application generates a random secret key on startup for session management
- For production use, set a permanent `SECRET_KEY` environment variable
- Implement file cleanup mechanisms to prevent disk space issues
- Add user authentication for multi-user environments
- Validate and sanitize CSV content before processing

## License

This project is open source and available for modification and distribution.
