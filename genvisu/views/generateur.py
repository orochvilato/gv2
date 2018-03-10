from genvisu import app,app_path, memcache
from genvisu.tools import json_response,image_response,getdot,maj1l, parse_content

from flask import render_template,request,Response, session, redirect
#from genvisu.controllers.generateur import gentest,test,interpreteur,savepage
from werkzeug.utils import secure_filename
from base64 import b64encode,b64decode
