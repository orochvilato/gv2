from genvisu import app
from flask import redirect
from genvisu.views.social_auth import require_login

@app.route('/ttt')
@require_login
def view_root():
    return redirect('load/current')
