# -*- coding: utf-8 -*-

from genvisu import app, app_path, memcache,mdbrw,mdb
from genvisu.tools import image_response, parse_content
from flask import render_template, url_for, request, Response, session, redirect
import requests
from PIL import Image,ImageChops,ImageFont,ImageDraw
from selenium.webdriver.chrome import service
from StringIO import StringIO
from bson.objectid import ObjectId
import os

from genvisu.views.generateur import get_dimensions

def getSnapshot(url,width,height,key):
    from selenium import webdriver
    options = webdriver.ChromeOptions()
    options.binary_location = '/usr/bin/google-chrome'
    options.add_argument('headless')
    options.add_argument('window-size=%dx%d' % (width,height+100))
    cdservice = service.Service('/usr/bin/chromedriver')
    cdservice.start()
    driver = webdriver.Chrome(chrome_options=options)
    driver.get(url);


    im = Image.open(StringIO(driver.get_screenshot_as_png()))
    im2 = im.crop((0,0,width,height))
    driver.quit()
    cdservice.stop()
    output = StringIO()
    im2.save(output,'JPEG')

    return output.getvalue()

@app.route('/log/preview/<id>')
def logpreview(id):
    path = os.path.join(app_path,'data','exports',id+'.jpg')
    print path
    if os.path.isfile(path):
        return image_response('jpg',open(path).read())
    return "nope"
@app.route('/log')
def logs():
    mdbrw.exports.remove({'$or':[{'username':'OrO'},{'username':'Olivier ROCH VILATO'}]})
    for export in mdb.exports.find({'preview':{'$ne':True}}):
        export_id = export['_id']
        path = os.path.join(app_path,'data','exports')
        del export['_id']
        del export['timestamp']
        import uuid
        import json

        cachekey = str(uuid.uuid4())
        memcache.set(cachekey,json.dumps(export),time=30)
        url = request.host_url + 'visuel/'+export['visuel']+'?key='+cachekey
        w,h = get_dimensions(export['visuel'])
        print w,h
        with open(os.path.join(path,str(export_id)+'.jpg'),'w') as f:
            f.write(getSnapshot(url=url,width=w*4,height=h*4,key=cachekey))
        mdbrw.exports.update_one({'_id':export_id},{'$set':{'preview':True}})
    exports = []
    curday = None
    day = []
    top = {}
    for export in mdb.exports.find({},{'username':1,'timestamp':1}).sort('timestamp',-1):
        if export['username']:
            top[export['username']] = top.get(export['username'],0)+1

        if export['timestamp'].date() != curday:
            if day:
                exports.append((curday,day))
                day = []
        curday = export['timestamp'].date()
        day.append(export)
    exports.append((curday,day))
    return render_template('timeline.html', exports=exports,top=[ (i+1,x[0],x[1]) for i,x in enumerate(sorted(top.items(),key=lambda x:x[1],reverse=True)[:10])])
