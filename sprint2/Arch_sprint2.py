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
with Diagram('sprint2Arch', show=False, outformat='png', graph_attr=graphattr) as diag:
  with Cluster('env'):
     sys = Custom('','./qakicons/system.png')
### see https://renenyffenegger.ch/notes/tools/Graphviz/attributes/label/HTML-like/index
     with Cluster('ctx_cargoservice', graph_attr=nodeattr):
          cargoservice=Custom('cargoservice','./qakicons/symActorWithobjSmall.png')
          cargorobot=Custom('cargorobot','./qakicons/symActorWithobjSmall.png')
          mock_sensor=Custom('mock_sensor','./qakicons/symActorWithobjSmall.png')
          holdservice=Custom('holdservice','./qakicons/symActorWithobjSmall.png')
     with Cluster('ctxrobotsmart', graph_attr=nodeattr):
          robotsmart=Custom('robotsmart(ext)','./qakicons/externalQActor.png')
     cargoservice >> Edge(color='magenta', style='solid', decorate='true', label='<is_cargo_present<font color="darkgreen"> cargo_present cargo_absent</font> &nbsp; >',  fontcolor='magenta') >> mock_sensor
     cargoservice >> Edge(color='magenta', style='solid', decorate='true', label='<reserve_slot<font color="darkgreen"> reserve_ok reserve_fail</font> &nbsp; >',  fontcolor='magenta') >> holdservice
     cargorobot >> Edge(color='magenta', style='solid', decorate='true', label='<moverobot<font color="darkgreen"> moverobotdone moverobotfailed</font> &nbsp; getrobotstate<font color="darkgreen"> robotstate</font> &nbsp; >',  fontcolor='magenta') >> robotsmart
     cargoservice >> Edge(color='magenta', style='solid', decorate='true', label='<handle_cargo_load<font color="darkgreen"> cargo_load_success cargo_load_failed</font> &nbsp; >',  fontcolor='magenta') >> cargorobot
     cargorobot >> Edge(color='blue', style='solid',  decorate='true', label='<setrobotstate &nbsp; >',  fontcolor='blue') >> robotsmart
     cargoservice >> Edge(color='blue', style='solid',  decorate='true', label='<send_home &nbsp; >',  fontcolor='blue') >> cargorobot
diag
