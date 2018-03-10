#-*- coding: utf-8 -*-
from genvisu import app
from genvisu.tools import json_response
from genvisu.config_private import facebook_id, facebook_secret

from requests_oauthlib import OAuth2Session
from requests_oauthlib.compliance_fixes import facebook_compliance_fix
import requests
from flask import Flask, request, redirect, session, url_for
from urlparse import parse_qs


authorization_base_url = 'https://www.facebook.com/dialog/oauth'
token_url = 'https://graph.facebook.com/oauth/access_token'


@app.route("/auth/facebook")
def facebook_auth():
    redirect_uri = url_for('facebook_callback',_external=True)
    facebook = OAuth2Session(facebook_id, redirect_uri=redirect_uri)
    facebook = facebook_compliance_fix(facebook)

    # Redirect user to Facebook for authorization
    authorization_url, state = facebook.authorization_url(authorization_base_url)

    return redirect(authorization_url)

@app.route("/facebook/callback")
def facebook_callback():
    # Get the authorization verifier code from the callback url
    redirect_uri = url_for('facebook_callback',_external=True)
    facebook = OAuth2Session(facebook_id, redirect_uri=redirect_uri)
    facebook = facebook_compliance_fix(facebook)

    # Fetch the access token

    facebook.fetch_token(token_url, client_secret=facebook_secret,
                      authorization_response=request.url)

    # Fetch a protected resource, i.e. user profile
    infos = facebook.get('https://graph.facebook.com/me?').json()

    session['userid'] = 'facebook:{id}'.format(id=infos['id'])
    session['username'] = infos['name']

    #session['username'] = 'google:{user}'.format(user=infos['email'])
    return redirect(session['next'])
