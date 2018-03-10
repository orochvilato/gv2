# -*- coding: utf-8 -*-
from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor
from markdown.inlinepatterns import SimpleTagPattern
from markdown.util import etree
import re
DEL_RE = r'(--)(.*?)--'
INS_RE = r'(_)(.*?)_'
STRONG_RE = r'(\*)(.*?)\*'
STRONGER_RE = r'(\*\*)(.*?)\*\*'
EM_RE = r'(\/)(.*?)\/'

class MyExtension(Extension):
    def extendMarkdown(self, md, md_globals):
        del_tag = SimpleTagPattern(DEL_RE, 'del')
        md.inlinePatterns.add('del', del_tag, '>not_strong')
        ins_tag = SimpleTagPattern(INS_RE, 'ins')
        md.inlinePatterns.add('ins', ins_tag, '>del')
        stronger_tag = SimpleTagPattern(STRONGER_RE, 'stronger')
        md.inlinePatterns.add('stronger', stronger_tag, '>ins')
        strong_tag = SimpleTagPattern(STRONG_RE, 'strong')
        md.inlinePatterns['strong'] = strong_tag
        em_tag = SimpleTagPattern(EM_RE, 'em')
        md.inlinePatterns['emphasis'] = em_tag
        del md.inlinePatterns['strong_em']
        del md.inlinePatterns['em_strong']
        del md.inlinePatterns['emphasis2']





class ClassAdderTreeprocessor(Treeprocessor):
    """Markdown extension for h.markdownWithCssClass()"""
    def run(self, root):
        self.set_css_class(root)
        return root

    def set_css_class(self, element):
        def delfmt(e,fmt):
            if e.tail and fmt in e.tail:
                e.tail = e.tail.replace('|'+fmt,'')
            if e.text and fmt in e.text:
                e.text = e.text.replace('|'+fmt,'')

        """Sets class attribute of P tags to configured CSS class."""
        for child in element:
            if child.tag == "p":
                m = re.search(r'^(.*)\|([A-Z0-9,]+) *</p>$',etree.tostring(child))
                if m:
                    fmt = m.groups()[1]
                    delfmt(child,fmt)
                    for e in child:
                        delfmt(e,fmt)

                    css = []
                    for code in m.groups()[1].split(','):
                        if code[0]=='C':
                            css.append('color'+code[1:])
                        elif code[0]=='R':
                            css += ['bgcolor'+code[1:],'reverse']
                        elif code=='MAJ':
                            css.append('uppercase')
                        else:
                            css.append(code)
                    child.set("class", " ".join(css)) #set the class attribute
            self.set_css_class(child) # run recursively on children

class ClassAdderExtension(Extension):
    """Markdown extension for h.markdownWithCssClass()"""

    def extendMarkdown(self, md, md_globals):
        # Insert a tree-processor that adds the configured CSS class to P tags
        treeprocessor = ClassAdderTreeprocessor(md)
        treeprocessor.ext = self
        md.treeprocessors['css'] = treeprocessor
