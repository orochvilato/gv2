#-*- coding: utf-8 -*-
from genvisu import app

from genvisu.config_private import twitter_key, twitter_secret

from requests_oauthlib import OAuth2Session
import requests
from requests_oauthlib import OAuth1
from flask import Flask, request, redirect, session
from urlparse import parse_qs
import os
from functools import wraps
import json

# This information is obtained upon registration of a new client on twitter
key = twitter_key
secret = twitter_secret
request_url = u"https://api.twitter.com/oauth/request_token"
auth_url = u"https://api.twitter.com/oauth/authorize"
access_url = u"https://api.twitter.com/oauth/access_token"
update_url = u"https://api.twitter.com/1/statuses/update.json"




@app.route("/auth/twitter")
def twitter_auth():
    """ Step 1 of the authentication workflow, obtain a temporary
    resource owner key and use it to redirect the user. The user
    will authorize the client (our flask app) to access its resources
    and perform actions in its name (aka get feed and post updates)."""

    # In this step you will need to supply your twitter provided key and secret
    twitter = OAuth1(key, client_secret=secret)

    # We will be using the default method of supplying parameters, which is
    # in the authorization header.
    r = requests.post(request_url, auth=twitter)

    # Extract the temporary resource owner key from the response
    token = parse_qs(r.content)[u"oauth_token"][0]

    # Create the redirection url and send the user to twitter
    # This is the start of Step 2
    auth = u"{url}?oauth_token={token}&next=toto".format(url=auth_url, token=token)
    return redirect(auth)


@app.route("/twitter/callback", methods=["GET", "POST"])
def twitter_callback():
    """ Step 2 & 3 of the workflow. The user has now been redirected back to the
    callback URL you defined when you registered your client on twitter. This
    marks the end of step 2. In step 3 we will obtain the resource owner credentials.
    The callback url query will include 2 extra parameters that we need, the verifier
    and token (which is the same temporary key that we obtained in step 1."""

    verifier = request.args.get(u"oauth_verifier")
    token = request.args.get(u"oauth_token")

    # In this step we also use the verifier
    twitter = OAuth1(key, client_secret=secret, resource_owner_key=token,
            verifier=verifier)
    r = requests.post(access_url, auth=twitter)

    # This is the end of Step 3, we can now extract resource owner key & secret
    # as well as some extra information such as screen name.
    info = parse_qs(r.content)
    import time
    timestamp = str(int(time.time()))

    # Save credentials in the session, it is VERY important that these are not
    # shown to the resource owner, Flask session cookies are encrypted so we are ok.
    session["access_token"] = info["oauth_token"][0]
    session["token_secret"] = info["oauth_token_secret"][0]


    from twython import Twython
    twitter = Twython(key,secret,session['access_token'],session['token_secret'])
    infos = twitter.verify_credentials(include_email="false")
    print infos
    session["userid"] = "twitter:{id}".format(id=infos['id'])
    session["username"] = infos['name']

    # Show a very basic status update form
    return redirect(session['next'])
