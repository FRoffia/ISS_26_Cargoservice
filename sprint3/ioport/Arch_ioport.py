### conda install diagrams
from diagrams import Cluster, Diagram, Edge
from diagrams.custom import Custom
import os
os.environ['PATH'] += os.pathsep + 'C:/Program Files/Graphviz/bin/'

graphattr = {     #https://www.graphviz.org/doc/info/attrs.html
    'fontsize': '22',
}

nodeattr = {   
    'fontsize': '22',
    'bgcolor': 'lightyellow'
}

eventedgeattr = {
    'color': 'red',
    'style': 'dotted'
}
evattr = {
    'color': 'darkgreen',
    'style': 'dotted'
}
with Diagram('ioportArch', show=False, outformat='png', graph_attr=graphattr) as diag:
  with Cluster('env'):
     sys = Custom('','./qakicons/system.png')
### see https://renenyffenegger.ch/notes/tools/Graphviz/attributes/label/HTML-like/index
     with Cluster('ctx_cargoservice', graph_attr=nodeattr):
          cargoservice=Custom('cargoservice(ext)','./qakicons/externalQActor.png')
          holdservice=Custom('holdservice(ext)','./qakicons/externalQActor.png')
     with Cluster('ctx_ioport', graph_attr=nodeattr):
          ioservice=Custom('ioservice','./qakicons/symActorWithobjSmall.png')
          displayservice=Custom('displayservice','./qakicons/symActorWithobjSmall.png')
          holdstatusservice=Custom('holdstatusservice','./qakicons/symActorWithobjSmall.png')
     sys >> Edge( label='push', **evattr, decorate='true', fontcolor='darkgreen') >> ioservice
     sys >> Edge( label='display', **evattr, decorate='true', fontcolor='darkgreen') >> displayservice
     sys >> Edge( label='hold_status_request', **evattr, decorate='true', fontcolor='darkgreen') >> holdstatusservice
     holdstatusservice >> Edge(color='magenta', style='solid', decorate='true', label='<get_hold_status<font color="darkgreen"> hold_status</font> &nbsp; >',  fontcolor='magenta') >> holdservice
     ioservice >> Edge(color='magenta', style='solid', decorate='true', label='<load_request<font color="darkgreen"> load_accepted load_rejected retrylater</font> &nbsp; >',  fontcolor='magenta') >> cargoservice
diag
