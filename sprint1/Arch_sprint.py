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
with Diagram('sprintArch', show=False, outformat='png', graph_attr=graphattr) as diag:
  with Cluster('env'):
     sys = Custom('','./qakicons/system.png')
### see https://renenyffenegger.ch/notes/tools/Graphviz/attributes/label/HTML-like/index
     with Cluster('ctx_cargoservice', graph_attr=nodeattr):
          cargoservice=Custom('cargoservice','./qakicons/symActorWithobjSmall.png')
          cargorobot=Custom('cargorobot','./qakicons/symActorWithobjSmall.png')
          led=Custom('led','./qakicons/symActorWithobjSmall.png')
          sensor=Custom('sensor','./qakicons/symActorWithobjSmall.png')
          ioport=Custom('ioport','./qakicons/symActorWithobjSmall.png')
          hold_controller=Custom('hold_controller','./qakicons/symActorWithobjSmall.png')
     with Cluster('ctxrobotsmart', graph_attr=nodeattr):
          robotsmart26=Custom('robotsmart26(ext)','./qakicons/externalQActor.png')
     sys >> Edge( label='container_in', **evattr, decorate='true', fontcolor='darkgreen') >> cargoservice
     ioport >> Edge(color='magenta', style='solid', decorate='true', label='<load_request<font color="darkgreen"> load_accepted load_rejected retrylater</font> &nbsp; >',  fontcolor='magenta') >> cargoservice
     cargorobot >> Edge(color='magenta', style='solid', decorate='true', label='<moverobot<font color="darkgreen"> moverobotdone moverobotfailed</font> &nbsp; >',  fontcolor='magenta') >> robotsmart26
     cargoservice >> Edge(color='magenta', style='solid', decorate='true', label='<reserve_slot<font color="darkgreen"> reserve_ok reserve_fail</font> &nbsp; >',  fontcolor='magenta') >> hold_controller
     cargoservice >> Edge(color='magenta', style='solid', decorate='true', label='<is_cargo_present<font color="darkgreen"> cargo_present cargo_absent</font> &nbsp; >',  fontcolor='magenta') >> sensor
     cargoservice >> Edge(color='magenta', style='solid', decorate='true', label='<handle_cargo_load<font color="darkgreen"> cargo_load_success cargo_load_failed</font> &nbsp; >',  fontcolor='magenta') >> cargorobot
diag
