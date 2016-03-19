var dat = {},
    nodes = [],
    links = [];
var traits = {},
    targets = {},
    genes = {},
    gene2genes = {};
var traitId = 0,
    targetId = 0,
    nodeId = 0;

var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    radius = 3;

width *= 0.95;
height *= 0.95;

var opacity = 0.1;

var focusMode = false,
    focusedNode;

var clickedOnce = false;
var timer;

var force = d3.layout.force()
    .gravity(.05)
    .friction(0.3)
    .linkStrength(0.1)
    .size([width, height])
    .linkDistance(50)
    .on("tick", tick);

var drag = force.drag()
    .on("dragstart", dragstart);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .direction(function(d) {
        if (d.x < width/2)
			if (d.y < height/2)
				return 'se';
			else
				return 'ne';
		else
			if (d.y < height/2)
				return 'sw';
			else
				return 'nw';

    })
    .html(function(d) {
        return '<span class="' + d.class + '">' + d.label + '</span>';
    });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "black")
    .call(tip);

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

function viz() {
    var graph = {
        "nodes": nodes,
        "links": links
    };

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .linkStrength(function(link) {
            return link.linkStrength;
        })
        .linkDistance(function(link) {
            return link.linkDistance;
        })
        .charge(function(node) {
            return node.charge;
        })
        .start();

    link = link.data(graph.links)
        .enter().append("line")
        .attr("class", function(link) {
            return link.class;
        });

    node = node.data(graph.nodes)
        .enter().append("circle")
        .attr("class", function(node) {
            return node.class;
        })
        .attr("r", function(node) {
            return node.r;
        })
        .attr("charge", function(node) {
            return node.charge;
        })
        .attr("chargeDistance", function(node) {
            return node.chargeDistance;
        })
        .attr("friction", function(node) {
            return node.friction;
        })
        .attr("size", function(node) {
            return node.size;
        })
        .on('mouseover', function(node) {
            tip.show(node);
            if (focusMode)
                return;
            fade(node, opacity);
        })
        .on('mouseout', function(node) {
            tip.hide(node);
            if (focusMode)
                return;
            unfade(node, opacity);
        })
        .on('dblclick', dblclickEvent)
        .call(drag);

    svg.on('dblclick', function() {
        if (focusMode && focusedNode) {
            focusMode = false;
            show(focusedNode);
            unfade(focusedNode, opacity);
        }

    });
}

function fade(d, opacity) {
    link.style("opacity", function(o) {
        return isNeighbourLink(d, o) ? 1 : opacity;
    });

    node.style("opacity", function(o) {
        return isNeighbour(d, o) ? 1 : opacity;
    });
}

function hide(d) {
    link.style("visibility", function(o) {
        return isNeighbourLink(d, o) ? "visible" : "hidden";
    });

    node.style("visibility", function(o) {
        return isNeighbour(d, o) ? "visible" : "hidden";
    });
}

function unfade(d, opacity) {

    link.style("opacity", function(o) {
        return 1;
    });

    node.style("opacity", function(o) {
        return 1;
    });
}

function show(d) {

    link.style("visibility", function(o) {
        return "visible";
    });

    node.style("visibility", function(o) {
        return "visible";
    });
}

function isNeighbour(d, o) {
    if (d.type == "gene2gene") {
        return d === o || d.genes.indexOf(o) > -1 || d.traits.indexOf(o) > -1 || d.targets.indexOf(o) > -1;
    } else if (d.type == "gene" || d.type == "trait" || d.type == "target") {
        if (d.gene2genes.indexOf(o) > -1)
            return true;
        for (var i = 0; i < d.gene2genes.length; i++) {
            if (d.gene2genes[i].genes.indexOf(o) > -1 || d.gene2genes[i].traits.indexOf(o) > -1 || d.gene2genes[i].targets.indexOf(o) > -1)
                return true;
        }
        return d === o;
    }
}

function isNeighbourLink(d, o) {
    if (d.type == "gene2gene")
        return o.source === d || o.target === d;
    else if (d.type == "gene" || d.type == "trait" || d.type == "target") {
        for (var i = 0; i < d.gene2genes.length; i++) {
            if (o.source === d.gene2genes[i] || o.target === d.gene2genes[i])
                return true;
        }
        return false;
    }
}

function tick() {
    node
        .filter(function(d) {
            return d.type == "trait";
        })
        .attr("cx", function(d) {
            return d.x = Math.max(2 * radius, Math.min(5 * radius, d.x));
        })
        .attr("cy", function(d) {
            return d.y = Math.max(5 * radius, Math.min(height - 5 * radius, d.y));
        });
    node
        .filter(function(d) {
            return d.type == "target";
        })
        .attr("cx", function(d) {
            return d.x = Math.max(width - 5 * radius, Math.min(width - 2 * radius, d.x));
        })
        .attr("cy", function(d) {
            return d.y = Math.max(5 * radius, Math.min(height - 5 * radius, d.y));
        });
    node
        .filter(function(d) {
            return d.type == "gene" || d.type == "gene2gene";
        })
        .attr("cx", function(d) {
            return d.x = Math.max(radius, Math.min(width - radius, d.x));
        })
        .attr("cy", function(d) {
            return d.y = Math.max(radius, Math.min(height - radius, d.y));
        });

    link.attr("x1", function(d) {
            return d.source.x;
        })
        .attr("y1", function(d) {
            return d.source.y;
        })
        .attr("x2", function(d) {
            return d.target.x;
        })
        .attr("y2", function(d) {
            return d.target.y;
        });

}

function dblclickEvent(d) {
    // console.log("double click");
    if (!focusMode) {
        hide(d);
        focusMode = true;
        focusedNode = node;
    } else {
        show(focusedNode);
        focusMode = false;
        focusedNode = null;
        console.log("focus true");
    }
    d3.select(this).classed("fixed", d.fixed = false);
    d3.event.stopPropagation();
}

function dragstart(d) {
    d3.select(this).classed("fixed", d.fixed = true);
}


var fisheye = d3.fisheye.circular().radius(200);

svg.on("mousemove", function() {
    fisheye.focus(d3.mouse(this));

    node.each(function(d) {
        d.fisheye = fisheye(d);
    });
    node
        .attr("cx", function(d) {
            return d.fisheye.x;
        })
        .attr("cy", function(d) {
            return d.fisheye.y;
        })
        .attr("r", function(d) {
            return Math.pow(3, d.fisheye.z - 1) * d.r;
        });

    link.attr("x1", function(d) {
            return d.source.fisheye.x;
        })
        .attr("y1", function(d) {
            return d.source.fisheye.y;
        })
        .attr("x2", function(d) {
            return d.target.fisheye.x;
        })
        .attr("y2", function(d) {
            return d.target.fisheye.y;
        });
});
