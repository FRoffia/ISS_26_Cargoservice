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
with Diagram('sprint0Arch', show=False, outformat='png', graph_attr=graphattr) as diag:
  with Cluster('env'):
     sys = Custom('','./qakicons/system.png')
### see https://renenyffenegger.ch/notes/tools/Graphviz/attributes/label/HTML-like/index
     with Cluster('ctx_cargoservice', graph_attr=nodeattr):
          cargoservice=Custom('cargoservice','./qakicons/symActorSmall.png')
     with Cluster('ctx_robot', graph_attr=nodeattr):
          cargorobot=Custom('cargorobot','./qakicons/symActorSmall.png')
     with Cluster('ctx_sensor', graph_attr=nodeattr):
          led=Custom('led','./qakicons/symActorSmall.png')
          sensor=Custom('sensor','./qakicons/symActorSmall.png')
     with Cluster('ctx_ioport', graph_attr=nodeattr):
          ioport=Custom('ioport','./qakicons/symActorSmall.png')
     ioport >> Edge(color='magenta', style='solid', decorate='true', label='<load_request<font color="darkgreen"> load_accepted load_rejected retrylater</font> &nbsp; >',  fontcolor='magenta') >> cargoservice
diag
