from flask import session, redirect, render_template, request
from functools import wraps

def require_login(f):
    @wraps(f)
    def decorated_function(*args,**kwargs):
        ext = request.url.split('.')[-1]
        if 'userid' in session or ext in ['js','css','png','svg','jpg','jpeg']:
            return f(*args,**kwargs)
        session['next'] = request.url
        return render_template('login.html')
    return decorated_function

from genvisu.views.social_auth import twitter, google, github, facebook
from genvisu import app


@app.route("/logged")
def logged():
    return "logged"

@app.route("/logout")
def logout():
    if 'userid' in session.keys():
        del session['userid']
    if 'username' in session.keys():
        del session['username']
    return redirect('/')
