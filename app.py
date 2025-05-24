from vercel_wsgi import make_lambda_handler
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
import requests
from datetime import datetime
import os
from flask_wtf import CSRFProtect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration from environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['GITHUB_API_KEY'] = os.getenv('GITHUB_API_KEY')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'static/images')

# Flask-Mail Configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

csrf = CSRFProtect(app)
mail = Mail(app)

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/projects')
def projects_page():
    headers = {'Authorization': f'token {app.config["GITHUB_API_KEY"]}'}
    try:
        # Fetch all repositories
        repos = requests.get(
            'https://api.github.com/users/Alishan45/repos',
            headers=headers
        ).json()
        
        # Sort repositories by most recently updated
        repos.sort(key=lambda repo: repo['updated_at'], reverse=True)
        
    except Exception as e:
        app.logger.error(f"Error fetching repos: {e}")
        repos = []

    return render_template('projects.html', repos=repos)

@app.route('/contact', methods=['POST'])
def contact():
    name = request.form.get('name')
    email = request.form.get('email')
    message = request.form.get('message')

    if name and email and message:
        try:
            msg = Message(
                subject=f"New Contact Form Submission from {name}",
                recipients=[os.getenv('MAIL_DEFAULT_SENDER')],
                body=f"""
                Name: {name}
                Email: {email}
                Message: {message}
                """
            )
            mail.send(msg)
            flash('Your message has been sent successfully!', 'success')
        except Exception as e:
            app.logger.error(f"Error sending email: {e}")
            flash('There was an error sending your message. Please try again later.', 'error')

    return redirect(url_for('home'))

@app.context_processor
def inject_now():
    return {'now': datetime.now()}

@app.template_filter('datetimeformat')
def datetimeformat(value, format='%b %d, %Y'):
    if isinstance(value, str):
        value = datetime.strptime(value, '%Y-%m-%dT%H:%M:%SZ')
    return value.strftime(format)

handler = make_lambda_handler(app)
