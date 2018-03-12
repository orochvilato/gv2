# -*- coding: utf-8 -*-

from genvisu import app, app_path, memcache
from genvisu.tools import image_response, parse_content
from flask import render_template, url_for, request, Response
import re
import requests
import os

visuels = {
    'carre1':'fi/carre1',
    'urgdem':'liec/urgdem',
    'eurque':'liec/eurque',
    'paxint':'liec/paxint',
    'prohum':'liec/prohum',
    'urgeco':'liec/urgeco',
    'urgsoc':'liec/urgsoc'
    }

@app.route('/senddata',methods=['POST'])
def senddata():
    import uuid
    cachekey = str(uuid.uuid4())
    memcache.set(cachekey,request.form,time=600);
    return cachekey
@app.route('/edit/<visuelid>')
def generateur(visuelid):
    if request.method == 'GET':
        path_visuel = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'index.html')
        doc = open(path_visuel,'r').read()
        import re
        m = re.search(r'<meta dimension="([0-9]+x[0-9]+)">',doc,re.MULTILINE)
        if m:
            width,height = [int(x) for x in m.groups()[0].split('x')]
        
        return render_template('generateur.html', visuel_path='/visuel/'+visuelid , width=100, height=100)

def returnfile(folder,_file):
    if not request.referrer:
        return ""
    visuelid = request.referrer.split('/')[-1].split('?')[0]
    import mimetypes
    mimetype = mimetypes.guess_type(_file)[0]

    path = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],folder,_file)
    return Response(open(path,'r').read(),mimetype=mimetype)

@app.route('/css/<cssfile>')
def css(cssfile):
    return returnfile('css',cssfile)

@app.route('/img/<imgfile>')
def img(imgfile):
    return returnfile('img',imgfile)

@app.route('/js/<jsfile>')
def js(cssfile):
    return returnfile('js',jsfile)


@app.route('/check_status')
def checkstate():
    key = request.args.get('key')
    if not key:
        data = {'etat':'Erreur','avancement':0}
    else:
        r = requests.get('http://127.0.0.1:8888/status?key='+key)
        print r.content
        data = r.json()
        print data
        if not data:
            data = {'etat':'Erreur','avancement':0}
    import json

    return json.dumps(data)

@app.route('/retrieve_image')
def retrieve_image():
    key = request.args.get('key')
    r = requests.get('http://127.0.0.1:8888/retrieve_snapshot?key='+key)
    resp = Response(r.content)

    for k,v in r.headers.iteritems():
        resp.headers[k] = v
    return resp

@app.route('/export')
def export():
    key = request.args.get('key')
    width = request.args.get('width',1024)
    height = request.args.get('height',1024)

    data = None
    if key:
        data = memcache.get(key)
        if data:
            import json
            data = json.loads(data['data'])
    if data:
        url = request.url_root[:-1]+data['path']+'?key='+key
        name = data['path'].split('/')[-1]
        import datetime
        watermark = {'ip':request.environ['REMOTE_ADDR'],'visuel':name, 'date':datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')}
        import json
        r = requests.post('http://127.0.0.1:8888/prepare',data={'url':url,'width':width,'height':height, 'name':name, 'watermark':json.dumps(watermark)})
        return r.content





@app.route('/visuel/<visuelid>')
def visuel(visuelid):
    key = request.args.get('key')
    visuelid = visuelid.split('?')[0]
    # validation visuelid
    path = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'index.html')
    html = open(path,'r').read()
    xml = parse_content(html)

    data = None
    if key:
        data = memcache.get(key)
        if data:
            import json
            data = json.loads(data['data'])

    if data:
        zones = data['zones']
        images = data['images']
        for i,e in enumerate(xml.xpath('//div[contains(@class,"image")]')):
            id = e.attrib['id']
            e.attrib['style'] = images[id]

        for i,e in enumerate(xml.xpath('//div[@class="zone"]')):
            id = e.attrib['id']
            for child in list(e):
                e.remove(child)
            txml = parse_content(zones[id])
            if len(txml):
                for child in list(txml)[0]:
                    e.append(child)

        from lxml import etree
        html = etree.tostring(xml,method='html')
    return html

def _proxy(*args, **kwargs):
    resp = requests.request(
        method=request.method,
        url='http://127.0.0.1:8888/checkfile',
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False)

    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    response = Response(resp.content, resp.status_code, headers)
    return response

@app.route('/checkvisuel', methods=['GET','POST'])
def checkvisuel():
    return _proxy()
