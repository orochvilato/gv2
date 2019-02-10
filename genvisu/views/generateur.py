# -*- coding: utf-8 -*-

from genvisu import app, app_path, memcache,mdbrw,mdb
from genvisu.tools import image_response, parse_content, json_response
from flask import render_template, url_for, request, Response, session, redirect, render_template_string
import re
import requests
import os
import time

visuels = {
    'bingo':'fi/bingo',
    'test':'fi/test',
    '22mars':'fi/affiche2',
    'affiche':'fi/affiche',
    'affiche2':'fi/affiche2',
    'evenement':'fi/evenement',
    'evenement2':'fi/evenement2',
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
        'evenement2':{'titre':'Evènement 2x1', 'ratio':0.5},
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
    print request.form.get('data')
    print memcache.get(cachekey)

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

@app.route('/demo')
def demo():
    return publicvisuel('evenement2')

@app.route('/22mars')
def mars22():
    return publicvisuel('affiche2')

def publicvisuel(visuelid):
    width,height = get_dimensions(visuelid)
    return render_template('generateur.html',
                            public=True,
                            demo=True,
                            sauvegarder=True,
                            visuel=visuelid,
                            visuel_path='/visuel/'+visuelid,
                            dimset=dimset(width,height),
                            width=width,
                            height=height,
                            options=parseOptions(visuelid),
                            actions=parseActions(visuelid)
                            )

depth = []
def parseSelectItems(data,item):
    global depth
    depth.append(item['id'])
    data['paths'][item['id']] = ','.join(depth)
    if 'items' in item.keys():
        data['lists'][item['id']] = []
        for it in item['items']:
            data['lists'][item['id']].append({'id':it['id'],'label':it['label'],'path':','.join(depth)})
            data['maxdepth'] = max(data['maxdepth'],len(depth))
            parseSelectItems(data,it)
    depth = depth[:-1]


def parseOptions(visuelid):
    import json
    option_path = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'options.yml')
    options = {'_order':[]}

    if not os.path.exists(option_path):
        return options

    import yaml
    for option in yaml.load_all(open(option_path).read()):
        options['_order'].append(option['id'])
        if option['type']=='select':
            select = options[option['id']] = {'type':'select','label':option['label'],'lists':{},'paths':{},'maxdepth':0}
            parseSelectItems(select,option)
        elif option['type'] in ('checkbox','date','time'):
            options[option['id']] = option
    return options

def parseActions(visuelid):
    import json
    action_path = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'actions.yml')
    if not os.path.exists(action_path):
        return {}

    import yaml
    actions = {}
    actions_cfg = yaml.load(open(action_path).read())
    templates =  actions_cfg.get('templates',{})
    for id,values in actions_cfg.iteritems():
        if id=="templates":
            continue

        actions[id] = {}
        for val,act in values.iteritems():

            actions[id][val] = {'targets':[],'params':{}}

            if 'templates' in act.keys():
                for tmpl in act['templates']:
                    if tmpl['name'] in templates.keys():
                        template = templates[tmpl['name']]
                        defaults = template.get('defaults',{})
                        params = dict(tmpl)
                        del params['name']
                        actions[id][val]['params'].update(params)
                        current_tgts = actions[id][val].get('targets',[])
                        actions[id][val].update({'targets':current_tgts+template.get('targets',[])})
            for tgt in act.get('targets',[]):
                actions[id][val]['targets'].append(tgt)
    return actions

@app.route('/testopt')
def testopt():

    return render_template('options.html',options=parseOptions('test'),actions=parseActions('test'))

@app.route('/edit/<visuelid>')
@require_login
def editvisuel(visuelid):
    if request.method == 'GET':
        if 'userid' in session.keys():
            user = session['userid']
        width,height = get_dimensions(visuelid)
        return render_template('generateur.html',
                            saves=load_saves(user),
                            sauvegarder=True,
                            visuel=visuelid,
                            visuel_path='/visuel/'+visuelid ,
                            dimset=dimset(width,height),
                            demo=False,
                            width=width,
                            height=height,
                            options=parseOptions(visuelid),
                            actions=parseActions(visuelid))

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
            return render_template('generateur.html',
             saves=load_saves(user),
             sauvegarder=True,
             visuel=visuelid,
             visuel_path='/visuel/'+visuelid+'?key='+cachekey ,
             dimset=dimset(width,height),
             demo=False,
             width=width,
             height=height,
             options=parseOptions(visuelid),
             actions=parseActions(visuelid))

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
    if os.path.exists(path):
        return Response(open(path,'r').read(),mimetype=mimetype)
    else:
        return "Nope"

@app.route('/css/<cssfile>')
def css(cssfile):
    return returnfile('css',cssfile)

@app.route('/img/<imgfile>')
def img(imgfile):
    return returnfile('img',imgfile)

@app.route('/js/<jsfile>')
def js(jsfile):
    return returnfile('js',jsfile)


@app.route('/check_status')
def checkstate():
    key = request.args.get('key')
    if not key:
        data = {'etat':'Erreur','avancement':0}
    else:
        r = requests.get('http://127.0.0.1:8888/status?key='+key)
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
            path = data['path'].split('?')[0]
            url = request.url_root[:-1]+path+'?key='+key
            name = path.split('/')[-1]
            import datetime
            watermark = {'ip':request.environ['REMOTE_ADDR'],'userid':session.get('userid',None),'username':session.get('username',None),'visuel':name, 'date':datetime.datetime.now().strftime('%Y/%m/%d %H:%M:%S')}
            log = dict(watermark)
            log.update(data)
            log['timestamp'] = datetime.datetime.now()
            mdbrw.exports.insert_one(log)
            import json
            r = requests.post('http://127.0.0.1:8888/prepare',data={'url':url,'width':width,'height':height, 'name':name, 'watermark':json.dumps(watermark)})
            return r.content
    return "Nope"

@app.route('/bingo')
def bingo():
    path = os.path.join(app_path,'genvisu','modeles',visuels['bingo'],'index.html')
    templ = open(path,'r').read().decode('utf8')
    slots = ['test']*20
    return render_template_string(templ,slots=slots)



@app.route('/visuel/<visuelid>')
def visuel(visuelid):
    from genvisu.tools import render
    key = request.args.get('key')
    visuelid = visuelid.split('?')[0]
    # validation visuelid

    options = {}
    data = None
    if key:
        data = memcache.get(key)
        if data:
            import json
            data = json.loads(data)
            zones = data.get('zones',{})
            images = data.get('images',{})
            options = data.get('options',{})


    path = os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'index.html')
    templ = open(path,'r').read().decode('utf8').replace('</body>','{% include "actions.html" %}</body>')
    html = render_template_string(templ,options=options,actions=parseActions(visuelid),optionsdefs = parseOptions(visuelid))
    #html = render(os.path.join(app_path,'genvisu','modeles',visuels[visuelid],'index.html'),{'options':{},'actions':parseActions(visuelid)})
    xml = parse_content(html)
    if data:
        zones = data.get('zones',{})
        images = data.get('images',{})
        #options = data.get('options',{})
        #optionstoggle = data.get('optionstoggle',{})

        for i,e in enumerate(xml.xpath('//div[contains(@class,"image")]')):
            id = e.attrib['id']
            e.attrib['style'] = images.get(id,'')

        for i,e in enumerate(xml.xpath('//*[@option]')):
            option = e.attrib.get('option',None)
            e.attrib['visible'] = options.get(option,'yes' if option else 'no')


        for i,e in enumerate(xml.xpath('//*[@optionlist]')):
            option = e.attrib.get('optionlist',None)
            for se in e.xpath('*[@item]'):
                item = se.attrib.get('item',None)

                se.attrib['visible'] = 'yes' if options.get(option,None)==item else 'no'

        for i,e in enumerate(xml.xpath('//*[@optiontoggle]')):
            option = e.attrib.get('optiontoggle',None)
            value = e.attrib.get('value','')
            if optionstoggle.get(option):
                e.attrib['class'] = e.attrib.get('class','')+' '+value

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
