
const nodeHeight = 40;
const nodeWidth = 80;
const interLevelSpacing = 80;
const intraLevelSpacing = 50;
const tokenLevelSpacing = 140;

//Given an initial start node, returns a stack of its descendent nodes.
const topological = (nodeID, visited, stack, neighbours) => {
    visited.set(nodeID, true);

    for (let i = 0; i < neighbours.get(nodeID).length; i++) {
        if (visited.get(neighbours.get(nodeID)[i]) !== true) {
            topological(neighbours.get(nodeID)[i], visited, stack, neighbours);
        }
    }
    stack.push(nodeID);
    return stack;
};

export const layoutTree = (graphData) => {
    let directedNeighbours = new Map();

    //Assign empty neighbour arrays to each node id
    for (const node of graphData.nodes) {
        directedNeighbours.set(node.id, []);
    }

    //Fill in directed neighbour node id's for each node in corresponding arrays
    for (const e of graphData.edges) {
        let temp = directedNeighbours.get(e.source);
        temp.push(e.target);
        directedNeighbours.set(e.source, temp);
    }

    let topologicalStacks = new Map(); //Will hold each node's descendent nodes

    //Fill the topological stacks map with each node's descendents.
    for (const nodeOuter of graphData.nodes) {
        let stack = [];
        let visited = new Map();

        for (const nodeInner of graphData.nodes) {
            visited.set(nodeInner.id, false);
        }

        topologicalStacks.set(
            nodeOuter.id,
            topological(nodeOuter.id, visited, stack, directedNeighbours)
        );
    }

    //Find the node with the most descendents, which will dictate the number of levels needed.
    let numLevels = 0;
    for (const stack of topologicalStacks.values()) {
        numLevels = Math.max(numLevels, stack.length);
    }

    //Group nodes together based on the number of descendents they have.
    let nodesInLevels = [];
    for (
        let numDescendents = 1;
        numDescendents < numLevels + 1;
        numDescendents++
    ) {
        let currentLevel = [];
        for (let node of graphData.nodes) {
            //console.log("node: ",node," Length: ",topologicalStacks.get(node.id).length);
            if (topologicalStacks.get(node.id).length === numDescendents) {
                currentLevel.push(node);
            }
        }
        nodesInLevels.push(currentLevel);
    }

    let xPositions = new Map();
    let lowestNode = new Map();

    //Populate the xPositions map with each node's xPosition and the lowestNode map with the lowest node in each column.
    for (let level of nodesInLevels) {
        for (let n of level) {
            let column = n.anchors[0].from;
            xPositions.set(n.id, column);
            if (!lowestNode.has(column)) {
                lowestNode.set(column, n.id);
            }
        }
    }

    //This decides a nodes xPosition based on its neighbours/children.
    for (let level of nodesInLevels) {
        for (let n of level) {
            if (lowestNode.get(xPositions.get(n.id)) !== n.id) {
                //If the current node in the current level isn't the lowest node in its column
                if (directedNeighbours.get(n.id).length === 1) {
                    //If the current node has a single neighbour
                    xPositions.set(n.id, xPositions.get(directedNeighbours.get(n.id)[0])); //Set the current node's xPosition to its neighbour's
                } else {
                    let childrenInSpan = [];

                    //Finds the current node's children which are in it's span.
                    for (let neighbour of directedNeighbours.get(n.id)) {
                        if (
                            xPositions.get(neighbour) >= n.anchors[0].from &&
                            xPositions.get(neighbour) <= n.anchors[0].end
                        ) {
                            childrenInSpan.push(neighbour);
                        }
                    }

                    if (childrenInSpan.length !== 0) {
                        //If the current node has no children in it's span, leave its x position as it is.
                        let leftMostChildPos = xPositions.get(childrenInSpan[0]);
                        //Find the current node's left most child in it's span.
                        for (let child of childrenInSpan) {
                            leftMostChildPos = Math.min(
                                leftMostChildPos,
                                xPositions.get(child)
                            );
                        }
                        xPositions.set(n.id, leftMostChildPos); //Set the node's x position to its left most child in it's span.
                    }
                }
            }
        }
    }

    let nodesInFinalLevels = [];
    nodesInFinalLevels[0] = new Map();

    //Algorithm to resolve overlapping nodes.
    let numNodesProcessed = 0;
    let currentLevel = 0;
    while (numNodesProcessed !== graphData.nodes.length) {
        let nodeXPos = new Map();
        nodesInFinalLevels[currentLevel + 1] = new Map();
        for (let n of nodesInLevels[currentLevel]) {
            //If this xPosition is already taken in this level
            if (nodeXPos.has(xPositions.get(n.id))) {
                if (
                    topologicalStacks.get(n.id).length <
                    topologicalStacks.get(nodeXPos.get(xPositions.get(n.id))).length
                ) {
                    //Check which of the overlapping nodes have more descendents
                    //Set the node with the higher descendents in the next level, and remove it from this level.
                    let currentOccupyingNodeID = nodeXPos.get(xPositions.get(n.id));
                    nodeXPos.set(xPositions.get(n.id), n.id);
                    nodesInLevels[currentLevel + 1].push(
                        graphData.nodes[currentOccupyingNodeID]
                    );
                    nodesInFinalLevels[currentLevel].delete(currentOccupyingNodeID);
                    nodesInFinalLevels[currentLevel].set(n.id, n);
                } else {
                    nodesInLevels[currentLevel + 1].push(n);
                }
            } else {
                //Designate this node as the node occupying node this xPosition on this level.
                nodeXPos.set(xPositions.get(n.id), n.id);
                nodesInFinalLevels[currentLevel].set(n.id, n);
                numNodesProcessed++;
            }
        }
        currentLevel++;
    }

    let height = numLevels;

    //convert from array of maps to array of arrays
    let nodesInFinalLevelsArray = [nodesInFinalLevels.length];
    for (let level = 0; level < nodesInFinalLevels.length; level++) {
        nodesInFinalLevelsArray[level] = [];
        for (let n of nodesInFinalLevels[level].values()) {
            nodesInFinalLevelsArray[level].push(n);
        }
    }

    const totalGraphHeight =
        height * nodeHeight + (height - 1) * interLevelSpacing; //number of levels times the height of each node and the spaces between them

    const tokens = graphData.tokens.map((token) => ({
        ...token,
        id: token.index + graphData.nodes.length,
        x: token.index * (intraLevelSpacing + nodeWidth),
        y: totalGraphHeight + tokenLevelSpacing,
        relativeX: token.index,
        label: token.form,
        type: "token",
        group: "token"
    }));

    for (let level = 0; level < nodesInFinalLevelsArray.length; level++) {
        nodesInFinalLevelsArray[level] = nodesInFinalLevelsArray[level].map(
            (node) => ({
                ...node,
                x: xPositions.get(node.id) * (intraLevelSpacing + nodeWidth),
                y: totalGraphHeight - level * (totalGraphHeight / height),
                relativeX: xPositions.get(node.id),
                relativeY: level,
                label: node.label,
                type: "node",
                nodeLevel: level,
                group: "node",
                span: false
            })
        );
    }

    const finalGraphNodes = nodesInFinalLevelsArray.flat().concat(tokens);

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

        if (source.y === target.y) {
            cp = edgeRulesSameRow(
                edge,
                source,
                target,
                finalGraphNodes,
                graphData.edges
            );
        } else if (source.x === target.x) {
            cp = edgeRulesSameColumn(
                edge,
                source,
                target,
                finalGraphNodes,
                graphData.edges
            );
        } else {
            cp = edgeRulesOther(
                edge,
                source,
                target,
                finalGraphNodes,
                graphData.edges
            );
        }

        return {
            id: index,
            source: finalGraphNodes[sourceNodeIndex],
            target: finalGraphNodes[targetNodeIndex],
            type: "link",
            label: edge.label,
            x1: cp.x1,
            y1: cp.y1
        };
    });

    let tokenEdges = [tokens.size];
    let i = 0;
    for (let token of tokens) {
        if (lowestNode.get(token.relativeX) !== undefined) {
            let cp = controlPoints(
                finalGraphNodes[
                    finalGraphNodes.findIndex(
                        (node) => node.id === lowestNode.get(token.relativeX)
                    )
                    ],
                token,
                "",
                0
            );
            let temp = {
                source:
                    finalGraphNodes[
                        finalGraphNodes.findIndex(
                            (node) => node.id === lowestNode.get(token.relativeX)
                        )
                        ],
                target: token,
                type: "tokenLink",
                label: "",
                x1: cp.x1,
                y1: cp.y1
            };
            tokenEdges[i] = temp;
            i++;
        }
    }

    const allEdges = finalGraphEdges.concat(tokenEdges);

    return { nodes: finalGraphNodes, links: allEdges };
};

function controlPoints(source, target, direction, degree) {
    let x1 = 0;
    let y1 = 0;

    if (direction === "vertical-left") {
        if (source.y < target.y) {
            x1 = Math.min(
                target.x - (source.y - target.y) * degree,
                target.x + intraLevelSpacing + nodeWidth - 25
            );
        } else {
            x1 = Math.max(
                target.x - (source.y - target.y) * degree,
                target.x - intraLevelSpacing - nodeWidth + 25
            );
        }
        y1 = (source.y + target.y) / 2;
    } else if (direction === "vertical-right") {
        if (source.y < target.y) {
            x1 = Math.max(
                target.x + (source.y - target.y) * degree,
                target.x - intraLevelSpacing - nodeWidth + 25
            );
        } else {
            x1 = Math.min(
                target.x + (source.y - target.y) * degree,
                target.x + intraLevelSpacing + nodeWidth - 25
            );
        }
        y1 = (source.y + target.y) / 2;
    } else if (direction === "horizontal-left") {
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

function edgeRulesSameColumn(
    edge,
    source,
    target,
    finalGraphNodes,
    finalGraphEdges
) {
    let direction = "";
    let degree = 0.2;

    if (Math.abs(source.relativeY - target.relativeY) === 1) {
        //In the same column and 1 level apart
        //Is there an identical edge? If yes than 1 go left 1 go right, else straight line
        for (let e of finalGraphEdges) {
            if (source.id === e.from && target.id === e.to && edge !== e) {
                //There exists a duplicate edge
                if (edge.label.localeCompare(e.label) <= 0) {
                    direction = "vertical-right";
                } else {
                    direction = "vertical-left";
                }

                break;
            }
        }
    } else {
        //In the same column and more than level apart
        let found = false;
        for (let node of finalGraphNodes) {
            if (node.x === source.x) {
                if (node.y > source.y && node.y < target.y) {
                    //There exists a node inbetween the target and source node
                    //console.log(node);
                    found = true;
                    break;
                }
            }
        }
        if (found) {
            //Make the edge curve to avoid the clash, otherwise straight.
            let left = false;
            //Check if there is an outgoing or incoming edge from the left side
            for (let edge of finalGraphEdges) {
                if (edge.source === source.id && edge.target !== target.id) {
                    let neighbourNode =
                        finalGraphNodes[
                            finalGraphNodes.findIndex((node) => node.id === edge.target)
                            ];
                    if (source.x - neighbourNode.x === intraLevelSpacing + nodeWidth) {
                        left = true;
                    }
                }
            }

            degree = 0.4;
            if (left) {
                direction = "vertical-left";
            } else {
                direction = "vertical-right";
            }
        }
    }
    return controlPoints(source, target, direction, degree);
}

function edgeRulesSameRow(source, target) {
    let direction = "";
    let degree = 0.25;

    if (Math.abs(target.x - source.x) !== intraLevelSpacing + nodeWidth) {
        //On the same level and more than 1 space apart
        if (source.x < target.x) {
            direction = "horizontal-right";
        } else {
            direction = "horizontal-left";
        }

        //Check if there is an identical edge, change their curviture
    }

    return controlPoints(source, target, direction, degree);
}

function edgeRulesOther(
    edge,
    source,
    target,
    finalGraphNodes,
    finalGraphEdges
) {
    let direction = "";
    let degree = 0.2;

    // //Is there a node protruding close to the line
    // let xProtrusion = 0.0;
    // let yProtrusion = 0.0;
    // for (let node of finalGraphNodes) {
    //   if (
    //     ((node.y < source.y && node.y > target.y) ||
    //       (node.y > source.y && node.y < target.y)) &&
    //     ((node.x < source.x && node.x > target.x) ||
    //       (node.x > source.x && node.x < target.x))
    //   ) {
    //     let xtemp = Math.abs(node.x - source.x);
    //     let ytemp = Math.abs(node.y - target.y);
    //     if (ytemp > yProtrusion && xtemp > xProtrusion) {
    //       xProtrusion = xtemp;
    //       yProtrusion = ytemp;
    //     }
    //   }
    // }

    // xProtrusion = xProtrusion / Math.abs(target.x - source.x);
    // yProtrusion = yProtrusion / Math.abs(target.y - source.y);
    // //console.log(source.label, target.label, xProtrusion, yProtrusion);
    // if (xProtrusion >= 0.5 && yProtrusion >= 0.5) {
    //   direction = "custom";
    //   degree = target.x;
    //   return controlPoints(source, target, direction, degree);
    // }

    //Is there an identical edge? If yes than 1 go left 1 go right, else straight line
    for (let e of finalGraphEdges) {
        if (source.id === e.from && target.id === e.to && edge !== e) {
            //There exists a duplicate edge
            if (edge.label.localeCompare(e.label) <= 0) {
                direction = "vertical-right";
            }

            break;
        }
    }

    return controlPoints(source, target, direction, degree);
}