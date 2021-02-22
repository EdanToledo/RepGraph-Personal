const nodeHeight = 40;
const nodeWidth = 80;
const intraLevelSpacing = 50;

export const layoutFlat = (graphData) => {
    console.log(graphData);

    const nodes = graphData.nodes.map((node, index) => ({
        ...node,
        x: index * (nodeWidth + intraLevelSpacing),
        y: nodeHeight,
        label: node.label,
        type: "node",
        group: "node",
        span: false
    }));

    const finalGraphNodes = nodes;

    const finalGraphEdges = graphData.edges.map((edge, index) => {
        const sourceNodeIndex = finalGraphNodes.findIndex(
            (node) => node.id === edge.source
        );
        const targetNodeIndex = finalGraphNodes.findIndex(
            (node) => node.id === edge.target
        );

        const source = finalGraphNodes[sourceNodeIndex];
        const target = finalGraphNodes[targetNodeIndex];

        let cp;

        cp = edgeRulesSameRow(source, target);

        return {
            id: index,
            source: finalGraphNodes[sourceNodeIndex],
            target: finalGraphNodes[targetNodeIndex],
            label: edge.label,
            x1: cp.x1,
            y1: cp.y1
        };
    });

    return { nodes: finalGraphNodes, links: finalGraphEdges };
};

function controlPoints(source, target, direction, degree) {
    let x1 = 0;
    let y1 = 0;

    if (direction === "horizontal-left") {
        x1 = (source.x + target.x) / 2;
        y1 = target.y + (source.x - target.x) * degree;
    } else if (direction === "horizontal-right") {
        x1 = (source.x + target.x) / 2;
        y1 = target.y - (source.x - target.x) * degree;
    } else if (direction === "custom") {
        x1 = degree;
        y1 = source.y + nodeHeight;
    } else {
        x1 = (source.x + target.x) / 2;
        y1 = (source.y + target.y) / 2;
    }

    return { x1, y1 };
}

function edgeRulesSameRow(source, target) {
    let direction = "";
    let degree = 0.25;

    if (Math.abs(source.x - target.x) !== intraLevelSpacing + nodeWidth) {
        //On the same level and more than 1 space apart
        direction = "horizontal-left";
    }

    //Check if there is an identical edge, change their curviture

    return controlPoints(source, target, direction, degree);
}