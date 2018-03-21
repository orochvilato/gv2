# -*- coding: utf-8 -*-

from genvisu import app, app_path, memcache
from genvisu.tools import image_response, parse_content
from flask import render_template, url_for, request, Response, session, redirect
import re
import requests
import os

visuels = {
    '22mars':'fi/affiche2',
    'affiche':'fi/affiche',
    'affiche2':'fi/affiche2',
    'evenement':'fi/evenement',
    'urgdem':'liec/urgdem',
    'eurque':'liec/eurque',
    'paxint':'liec/paxint',
    'prohum':'liec/prohum',
    'urgeco':'liec/urgeco',
    'urgsoc':'liec/urgsoc',
    'radio1':'webradio/radio1',
    'radio2':'webradio/radio2',
    }

domaines = {
    'fi':{
        'evenement':{'titre':'Evènement 1x1', 'ratio':1},
        'affiche':{'titre':'affiche 1x1', 'ratio':1},
        'affiche2':{'titre':'affiche2 1x1', 'ratio':1}
    },
    'liec':{
        'eurque':{'titre':"L'Europe en question", 'ratio':1},
        'paxint':{'titre':"La paix et l'international", 'ratio':1},
        'prohum':{'titre':"Progrès Humain", 'ratio':1},
        'urgdem':{'titre':"Urgence démocratique", 'ratio':1},
        'urgeco':{'titre':"Urgence écologique", 'ratio':1},
        'urgsoc':{'titre':"Urgence sociale", 'ratio':1}
    },
    'webradio':{
        'radio1':{'titre':"1x1", 'ratio':1},
        'radio2':{'titre':"2x1", 'ratio':0.5625}
    }
}

from genvisu.controllers.backend import save_work,load_work, load_saves, load_work_name
from genvisu.views.social_auth import require_login

@app.route('/')
@require_login
def root():
    user = session['userid']
    return render_template('accueil.html', saves=load_saves(user))

@app.route('/senddata',methods=['POST'])
def senddata():
    slot = request.form.get('slot','autosave')
    if 'userid' in session.keys():
        user = session['userid']
        save_work(user,slot,request.form)
    import uuid
    cachekey = str(uuid.uuid4())
    memcache.set(cachekey,request.form.get('data'),time=600);
    return cachekey

def get_dimensions(visuelid):
    path_visuel = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'index.html')
    doc = open(path_visuel,'r').read()
    import re
    m = re.search(r'<meta dimension="([0-9\.]+x[0-9\.]+)">',doc,re.MULTILINE)
    if m:
        width,height = [float(x) for x in m.groups()[0].split('x')]
    else:
        width,height = 100,100

    return (width,height)


def dimset(width,height):
    return [(w,int(w*float(height/width))) for w in [2048,1024,512,256]]

@app.route('/22mars')
def publicvisuel():
    visuelid = 'affiche2'
    width,height = get_dimensions(visuelid)
    return render_template('generateur.html', public=True, sauvegarder=True, visuel=visuelid, visuel_path='/visuel/'+visuelid , dimset=dimset(width,height),width=width, height=height)

@app.route('/edit/<visuelid>')
@require_login
def editvisuel(visuelid):
    if request.method == 'GET':
        if 'userid' in session.keys():
            user = session['userid']
        width,height = get_dimensions(visuelid)
        return render_template('generateur.html', saves=load_saves(user), sauvegarder=True, visuel=visuelid, visuel_path='/visuel/'+visuelid , dimset=dimset(width,height),width=width, height=height)

@app.route('/load/<slot>')
@require_login
def loadvisuel(slot):
    if request.method == 'GET':
        if 'userid' in session.keys():
            user = session['userid']
        visuelid,data = load_work(user,slot)
        if data:
            width,height = get_dimensions(visuelid)
            import uuid
            cachekey = str(uuid.uuid4())
            memcache.set(cachekey,data,time=30);
            return render_template('generateur.html', saves=load_saves(user), sauvegarder=True, visuel=visuelid, visuel_path='/visuel/'+visuelid+'?key='+cachekey , dimset=dimset(width,height),width=width, height=height)
        else:
            return "erreur"
def returnfile(folder,_file):

    if not request.referrer:
        return ""
    if '/load/' in request.referrer:
        slot = request.referrer.split('/')[-1]
        visuelid = load_work_name(session.get('userid'),slot)
    else:
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
    width = request.args.get('w',1024)
    height = request.args.get('h',1024)

    data = None
    if key:
        data = memcache.get(key)
        if data:
            import json
            data = json.loads(data)
    if data:
        path = data['path'].split('?')[0]
        url = request.url_root[:-1]+path+'?key='+key
        name = path.split('/')[-1]
        import datetime
        watermark = {'ip':request.environ['REMOTE_ADDR'],'userid':session.get('userid',None),'username':session.get('username',None),'visuel':name, 'date':datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')}
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
            data = json.loads(data)

    if data:
        zones = data.get('zones',{})
        images = data.get('images',{})
        options = data.get('options',{})

        for i,e in enumerate(xml.xpath('//div[contains(@class,"image")]')):
            id = e.attrib['id']
            e.attrib['style'] = images.get(id,'')

        for i,e in enumerate(xml.xpath('//*[@option]')):
            option = e.attrib.get('option',None)
            if option:
                e.attrib['visible'] = options.get(option,'yes')

        for i,e in enumerate(xml.xpath('//div[contains(@class,"zone")]')):
            id = e.attrib['id']

            if id in zones.keys():
                for child in list(e):
                    e.remove(child)
                txml = parse_content(zones[id])
                if txml and len(txml):
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
@require_login
def checkvisuel():
    return _proxy()

@app.route('/preview/<visuelid>')
@require_login
def preview(visuelid):
    #import mimetypes
    #mimetype = mimetypes.guess_type('preview.png')[0]
    path = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'preview.png')
    return Response(open(path,'r').read(),mimetype='image/png')

@app.route('/visuels/<domaine>')
@require_login
def view_visuels(domaine):
    user = session.get('userid')
    dom = domaines[domaine]
    for k,v in dom.iteritems():
        if v['ratio']>1:
            v['preview_height'] = 200
            v['preview_width'] = 200/v['ratio']
        else:
            v['preview_width'] = 200
            v['preview_height'] = 200*v['ratio']

    return render_template('visuels.html', nomdomaine=domaine, saves=load_saves(user), domaine=domaines[domaine])
