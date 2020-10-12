import React, { useState, useEffect, useContext, useRef } from "react";
import Graph from "react-graph-vis";
import { AppContext } from "../../Store/AppContextProvider.js";
import { cloneDeep } from "lodash";
import Button from "@material-ui/core/Button";
import {
    CardContent,
    Grid, Typography,
} from "@material-ui/core";
import {useHistory} from "react-router-dom";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import {Virtuoso} from "react-virtuoso";
import ListItem from "@material-ui/core/ListItem";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Card from "@material-ui/core/Card";
import SubgraphVisualisation from "./SubgraphVisualisation";

const options = {
    physics: {
        enabled: false,
        forceAtlas2Based: {
            gravitationalConstant: -50000,
            centralGravity: 0.0,
            springConstant: 0.08,
            springLength: 100,
            damping: 0,
            avoidOverlap: 1
        }
    },
    autoResize: true,
    edges: {
        color: "rgba(156, 154, 154, 1)",
        smooth: true,
        /*smooth: {
              enabled: true,
              type: "dynamic",
              roundness: 1
            },*/
        physics: true,
        arrows: {
            to: {
                scaleFactor: 1.3
            }
        },
        arrowStrikethrough: false,
        endPointOffset: {
            from: 20,
            to: 0
        }
    },
    nodes: {
        shape: "box",
        color: "rgba(97,195,238,0.5)",
        font: { size: 14, strokeWidth: 4, strokeColor: "white" },
        widthConstraint: {
            minimum: 60,
            maximum: 60
        },
        heightConstraint: {
            minimum: 30
        }
    },
    height: "100%",
    width: "100%",
    interaction: { hover: true },
    groups: {
        node: {
            shape: "box",
            color: "rgba(84, 135, 237, 0.5)",
            font: { size: 14, strokeWidth: 4, strokeColor: "white" },
            widthConstraint: {
                minimum: 60,
                maximum: 60
            },
            heightConstraint: {
                minimum: 30
            }
        },
        token: {
            shape: "box",
            color: "rgba(84, 237, 110, 0.7)",
            font: { size: 14, strokeWidth: 4, strokeColor: "white" },
            widthConstraint: {
                minimum: 60,
                maximum: 60
            },
            heightConstraint: {
                minimum: 30
            }
        },
        longestPath: {
            shape: "box",
            color: "rgba(245, 0, 87, 0.7)",
            font: { size: 14, strokeWidth: 4, strokeColor: "white" },
            widthConstraint: {
                minimum: 60,
                maximum: 60
            },
            heightConstraint: {
                minimum: 30
            }
        },
        Selected: {
            shape: "box",
            color: "rgba(255, 0, 0, 0.65)",
            font: { size: 14, strokeWidth: 4, strokeColor: "white" },
            widthConstraint: {
                minimum: 60,
                maximum: 60
            },
            heightConstraint: {
                minimum: 30
            }
        }
    }
};

const SelectSubgraphVisualisation = () => {
    const { state, dispatch } = useContext(AppContext); //Provide access to global state
    const [currentVis, setCurrentVis] = React.useState(
        state.selectedSentenceVisualisation
    ); //Store the current visualisation data locally
    const history = useHistory(); //Access routing history
    const [searchResult, setSearchResult] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [selectedSentenceVisualisation, setSelectedSentenceVisualisation] = React.useState(null);

    function searchForSelectedSubgraph(){

        const currentSelection = getSelected(); //Get the currently selected nodes and edges
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show the loading animation

        //Search the backend for matches
        fetch(state.APIendpoint + "/SearchSubgraphPattern?graphID="+currentSelection.id+"&NodeId="+currentSelection.nodes.join(",")+"&EdgeIndices="+currentSelection.edges.join(","), requestOptions)
            .then((response) => response.text())
            .then((result) => {
                const jsonResult = JSON.parse(result);
                console.log(jsonResult); //Debugging
                setSearchResult(jsonResult.data); //Store the search results in local state
                setOpen(true); //Show the results to the user
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
            })
            .catch((error) => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
                console.log("error", error); //Log the error to console
                history.push("/404"); //Take the user to the error page
            });

    }

    //Function to get all the currently selected nodes and edges from the graph
    function getSelected() {
        //console.log(currentVis);
        let nodeID = [];
        let edgeID = [];
        let graphID = currentVis.id;

        //Find the selected nodes
        for (let x of currentVis.nodes) {
            if (x.group === "Selected") {
                nodeID.push(x.id);
            }
        }

        //Find the selected edges
        for (let x of currentVis.edges) {
            if (x.group === "Selected") {
                edgeID.push(x.id);
            }
        }

        const returnValue = { id: graphID, nodes: nodeID, edges: edgeID };
        console.log(returnValue); //Debugging

        return returnValue;
    }

    //Events that are enabled on the graph visualisation
    const events = {
        //Select event for when user selects a node or edge on the graph
        select: function (event) {
            let { nodes, edges } = event;

            let currentStandardVisualisation = cloneDeep(currentVis); //Deep clone the current visualisation

            //User selected or deselected a node -> update the graph visually
            for (const [i, x] of currentStandardVisualisation.nodes.entries()) {
                if (x.id === nodes[0] && x.group === "node") {
                    //If not selected - mark as selected
                    currentStandardVisualisation.nodes[i].group = "Selected";
                } else if (x.id === nodes[0] && x.group === "Selected") {
                    //Else if selected - deselect node
                    currentStandardVisualisation.nodes[i].group = "node";
                }
            }

            //If user selected an edge -> update the graph visually
            if (nodes.length === 0) {
                for (const [i, x] of currentStandardVisualisation.edges.entries()) {
                    if (x.id === edges[0] && x.group !== "Selected") {

                        if(x.group !== "tokenEdge"){
                            currentStandardVisualisation.edges[i] = {
                                ...x,
                                color: "rgba(0, 0, 0, 1)",
                                shadow: true,
                                group: "Selected",
                                background: {
                                    enabled: true,
                                    color: "#ff0000"
                                }
                            };
                        }

                    } else if (x.id === edges[0] && x.group === "Selected") {
                        currentStandardVisualisation.edges[i] = {
                            ...x,
                            color: "rgba(156, 154, 154, 1)",
                            group: "normal",
                            shadow: false,
                            background: {
                                enabled: false
                            }
                        };
                    }
                }
            }

            setCurrentVis(currentStandardVisualisation); //Update the current visualisation to reflect the selections made by the user
        }
    };

    //Handle when user selects one of the sentences returned in the results from the backend
    function handleClickSentenceResult(sentenceId) {
        console.log(sentenceId); //Debugging

        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show the loading animation

        fetch(state.APIendpoint + "/Visualise?graphID=" + sentenceId + "&format=" + state.visualisationFormat, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                const jsonResult = JSON.parse(result);
                console.log(jsonResult); //Debugging
                setSelectedSentenceVisualisation(jsonResult); //Store graph visualisation result
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
            })
            .catch((error) => {
                dispatch({type: "SET_LOADING", payload: {isLoading: false}}); //Stop the loading animation
                console.log("error", error); //Log the error to console
                history.push("/404"); //Take the user to the error page
            });
    }

    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
            style={{height:"100%", width:"100%"}}
        >
            <Grid item style={{height:"60vh", width:"100%"}}>
                <Graph
                    graph={currentVis}
                    options={options}
                    events={events}
                    getNetwork={(network) => {
                        network.on("hoverNode", function (params) {
                            network.canvas.body.container.style.cursor = 'pointer'
                        });
                    }}
                />
            </Grid>
            <Grid item>
                <Button color="Primary" onClick={searchForSelectedSubgraph}>
                    Search
                </Button>
            </Grid>
            <Dialog
                open={open}
                fullWidth={true}
                maxWidth="xl"
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Search Results:"}
                </DialogTitle>
                <DialogContent>
                    <Grid
                        style={{width:"100%", height:"100%"}}
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                        spacing={2}
                    >
                        <Grid container item xs={12}>
                            <Card variant="outlined" style={{width:"100%", height: "15vh"}}>
                                <CardContent style={{width:"100%", height: "100%"}}>
                                    {searchResult &&
                                    <Virtuoso
                                        style={{width: "100%", height: "100%"}}
                                        totalCount={searchResult.length}
                                        item={(index) => {
                                            return (
                                                <ListItem
                                                    button
                                                    key={index}
                                                    onClick={() => {
                                                        handleClickSentenceResult(searchResult[index].id);
                                                    }}
                                                >
                                                    <Typography>{searchResult[index].input}</Typography>
                                                </ListItem>
                                            );
                                        }}
                                        footer={() => (
                                            <div style={{padding: "1rem", textAlign: "center"}}>
                                                -- end of dataset --
                                            </div>
                                        )}
                                    />}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid container item xs={12}>
                            <Card variant="outlined" style={{width:"100%", height: "45vh"}}>
                                <CardContent style={{width:"100%", height: "100%"}}>
                                    {selectedSentenceVisualisation === null ?

                                        <Typography>Select
                                            a sentence from the results above.</Typography>

                                        :

                                        <SubgraphVisualisation
                                            subgraphGraphData={selectedSentenceVisualisation}/>

                                    }
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>

    );
};
export default SelectSubgraphVisualisation;