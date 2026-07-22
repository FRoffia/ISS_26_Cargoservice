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
with Diagram('devicesArch', show=False, outformat='png', graph_attr=graphattr) as diag:
  with Cluster('env'):
     sys = Custom('','./qakicons/system.png')
### see https://renenyffenegger.ch/notes/tools/Graphviz/attributes/label/HTML-like/index
     with Cluster('ctx_sensor', graph_attr=nodeattr):
          sensorservice=Custom('sensorservice','./qakicons/symActorWithobjSmall.png')
          mock_pusbutton=Custom('mock_pusbutton','./qakicons/symActorWithobjSmall.png')
     with Cluster('ctx_cargoservice', graph_attr=nodeattr):
          cargoservice=Custom('cargoservice(ext)','./qakicons/externalQActor.png')
     sys >> Edge( label='sonardata', **evattr, decorate='true', fontcolor='darkgreen') >> sensorservice
     sys >> Edge( label='push', **evattr, decorate='true', fontcolor='darkgreen') >> mock_pusbutton
     mock_pusbutton >> Edge(color='magenta', style='solid', decorate='true', label='<load_request<font color="darkgreen"> load_accepted load_rejected retrylater</font> &nbsp; >',  fontcolor='magenta') >> cargoservice
     sensorservice >> Edge(color='blue', style='solid',  decorate='true', label='<sensorError &nbsp; sensorOK &nbsp; container_in &nbsp; >',  fontcolor='blue') >> cargoservice
diag
