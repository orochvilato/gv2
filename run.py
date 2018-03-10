# -*- coding: utf-8 -*-

from genvisu import app, app_path, memcache
from genvisu.tools import image_response, parse_content
from flask import render_template, url_for, request, Response
import re
import os

visuels = {'carre1':'fi/carre1'}

@app.route('/senddata',methods=['POST'])
def senddata():
    import uuid
    cachekey = str(uuid.uuid4())
    memcache.set(cachekey,request.form,time=600);
    return cachekey
@app.route('/edit/<visuelid>')
def generateur(visuelid):
    if request.method == 'GET':
        # !! récuperer les dimensions du visuel (balise META)
        return render_template('generateur.html', visuel_path='/visuel/'+visuelid , width=100, height=100)

def returnfile(folder,_file):
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


@app.route('/export')
def export():
    key = request.args.get('key')


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


if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True,processes=10)
