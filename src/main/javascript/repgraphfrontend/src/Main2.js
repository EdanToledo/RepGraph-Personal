import React , {useContext} from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import {AppContext} from "./Store/AppContextProvider";
import {Button, Card, CardContent, Chip, Grid} from "@material-ui/core";
import Fab from "@material-ui/core/Fab";
import Popover from "@material-ui/core/Popover";
import Tooltip from "@material-ui/core/Tooltip";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import BuildIcon from "@material-ui/icons/Build";
import {determineAdjacentLinks, layoutHierarchy} from "./LayoutAlgorithms/layoutHierarchy";
import {layoutTree} from "./LayoutAlgorithms/layoutTree";
import {layoutFlat} from "./LayoutAlgorithms/layoutFlat";
import {useHistory} from "react-router-dom";
import {Graph} from "./Components/Graph/Graph";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import SentenceList from "./Components/Main/SentenceList";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";

import { ParentSize } from '@visx/responsive';
import InfoIcon from "@material-ui/icons/Info";
import DisplaySubsetTool from "./Components/AnalysisComponents/DisplaySubsetTool";
import SearchSubgraphPatternTool from "./Components/AnalysisComponents/SearchSubgraphPatternTool";
import CompareTwoGraphsTool from "./Components/AnalysisComponents/CompareTwoGraphsTool";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
         marginRight: "1rem"
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
    content: {
        padding: theme.spacing(1),
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        //border: "1px solid blue",
        // height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`
        height: "100vh"
    },
    graphDiv: {
        height: `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
        //border: "1px solid red",
        flex: "1",
        width: "100%"
    }
}));

const width = "100%";
const height = "100%";

export default function MiniDrawer() {
    const {state, dispatch} = useContext(AppContext); //Provide access to global state
    const classes = useStyles();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null); //Anchor state for popover graph legend

    const history = useHistory(); //Provide access to router history
    const [sentenceOpen, setSentenceOpen] = React.useState(false); //Local state of select sentence dialog
    const [dataSetResponseOpen, setDataSetResponseOpen] = React.useState(true); //Local state for upload dataset alert

    const [subsetDialogOpen, setSubsetDialogOpen] = React.useState(false); //Local state of subset dialog
    const [subgraphDialogOpen, setSubgraphDialogOpen] = React.useState(false); //Local state of subgraph dialog
    const [compareDialogOpen, setCompareDialogOpen] = React.useState(false); //Local state of compare dialog


    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const legendOpen = Boolean(anchorEl); //State of graph legend
    //Function to handle click on graph legend button
    const handleClickGraphLegend = (event) => {
        setAnchorEl(event.currentTarget);
    };

    //Functions to handle close of graph legend
    const handleCloseGraphLegend = () => {
        setAnchorEl(null);
    };

    //Handle change visualisation format setting in application app bar
    const handleChangeVisualisationFormat = (event, newFormat) => {
        //Enforce one format being selected at all times
        if (newFormat !== null) {
            dispatch({type: "SET_VISUALISATION_FORMAT", payload: {visualisationFormat: newFormat}}); //Set global state for visualisation format
            console.log(newFormat);
            //Update the currently displayed graph as well
            if (state.selectedSentenceID !== null) {
                let myHeaders = new Headers();
                myHeaders.append("X-USER", state.userID);
                let requestOptions = {
                    method: 'GET',
                    headers : myHeaders,
                    redirect: 'follow'
                };

                dispatch({type: "SET_LOADING", payload: {isLoading: true}}); //Show loading animation

                let graphData = null;
                switch (newFormat) {
                    case "1":
                        graphData = layoutHierarchy(state.selectedSentenceGraphData);
                        break;
                    case "2":
                        graphData = layoutTree(state.selectedSentenceGraphData);
                        break;
                    case "3":
                        graphData = layoutFlat(state.selectedSentenceGraphData);
                        break;
                    default:
                        graphData = layoutHierarchy(state.selectedSentenceGraphData);
                        break;
                }

                console.log("newFormat", newFormat, "graphData",graphData);

                dispatch({type: "SET_SENTENCE_VISUALISATION", payload: {selectedSentenceVisualisation: graphData}});
                dispatch({type: "SET_LOADING", payload: {isLoading: false}});
            }

        }
    }

    //Handle click close select sentence dialog
    const handleSentenceClose = () => {
        setSentenceOpen(false);
    };

    //Handle click subset tool menu button
    const handleSubsetToolClick = () => {
        setSubsetDialogOpen(true);
    }

    //Handle click close subset sentence dialog
    const handleSubsetDialogClose = () => {
        setSubsetDialogOpen(false);
    };

    //Handle click subgraph tool menu button
    const handleSubgraphToolClick = () => {
        setSubgraphDialogOpen(true);
    }

    //Handle click close subgraph sentence dialog
    const handleSubgraphDialogClose = () => {
        setSubgraphDialogOpen(false);
    };

    //Handle click compare tool menu button
    const handleCompareToolClick = () => {
        setCompareDialogOpen(true);
    }

    //Handle click close compare tool dialog
    const handleCompareToolDialogClose = () => {
        setCompareDialogOpen(false);
    };

    //Determine graphFormatCode
    let graphFormatCode = null;
    switch (state.visualisationFormat) {
        case "1":
            graphFormatCode = "hierarchical";
            break;
        case "2":
            graphFormatCode = "tree";
            break;
        case "3":
            graphFormatCode = "flat";
            break;
        default:
            graphFormatCode = "hierarchical";
            break;
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon />
                    </IconButton>
                    <div style={{marginRight:"1rem"}}>
                        <Typography variant="h6" noWrap>
                            RepGraph
                        </Typography>
                    </div>

                    <Grid className={classes.menuButton}>
                        <div>
                            <Fab color="primary" aria-label="add" variant="extended"
                                 className={classes.fabButton} onClick={handleClickGraphLegend}>
                                Show Graph Legend
                            </Fab>
                            <Popover
                                open={legendOpen}
                                anchorEl={anchorEl}
                                onClose={handleCloseGraphLegend}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}
                            >
                                <Card>
                                    <CardContent>
                                        <Grid container spacing={1}>
                                            <Grid item>
                                                <Chip label="AbstractNode" style={{
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    backgroundColor: state.visualisationOptions.groups.node.color
                                                }}/>
                                            </Grid>
                                            <Grid item>
                                                <Chip label="SurfaceNode" style={{
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    backgroundColor: state.visualisationOptions.groups.surfaceNode.color
                                                }}/>
                                            </Grid>
                                            <Grid item>
                                                <Chip label="Token" style={{
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    backgroundColor: state.visualisationOptions.groups.token.color
                                                }}/>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Popover>
                        </div>
                    </Grid>

                    <Grid className={classes.menuButton}>
                        <Tooltip arrow
                                 title={"Select visualisation format"}>
                            <ToggleButtonGroup
                                value={state.visualisationFormat}
                                exclusive
                                onChange={handleChangeVisualisationFormat}
                                aria-label="Visualisation formats"
                            >
                                <ToggleButton value="1" aria-label="Hierarchical">
                                    <Typography color={ "textPrimary" }>Hierarchical</Typography>
                                </ToggleButton>
                                <ToggleButton value="2" aria-label="Tree-like">
                                    <Typography color={ "textPrimary"}>Tree-like</Typography>
                                </ToggleButton>
                                <ToggleButton value="3" aria-label="Flat">
                                    <Typography color={"textPrimary"}>Flat</Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>

                        </Tooltip>
                    </Grid>

                    <Grid>
                        <Tooltip arrow
                                 title={state.selectedSentenceID === null ? "Select Sentence" : "Change Sentence"}>
                            <Fab color="primary" aria-label="add" variant="extended"
                                 className={classes.fabButton} onClick={() => {
                                setSentenceOpen(true);
                            }} disabled={state.dataSet === null}>
                                {state.selectedSentenceID === null ? "No Sentence Selected" : state.selectedSentenceID} {state.selectedSentenceID === null ?
                                <AddCircleOutlineIcon/> :
                                <BuildIcon/>}
                            </Fab>
                        </Tooltip>
                    </Grid>
                    <Grid className={classes.menuButton}>
                        <Tooltip arrow
                                 title={state.dataSet === null ? "Upload data-set" : "Upload new data-set"}>
                            <Fab color="primary" aria-label="add" variant="extended"
                                 className={classes.fabButton} onClick={() => {
                                history.push("/");
                            }}>
                                {state.dataSet === null ? "No Data-set Uploaded" : state.dataSetFileName} {state.dataSet === null ?
                                <CloudUploadIcon/> : <BuildIcon/>}
                            </Fab>
                        </Tooltip>
                    </Grid>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />
                <List>
                    <ListItem button onClick={handleSubsetToolClick}>
                        <ListItemIcon>{<MailIcon />}</ListItemIcon>
                        <ListItemText primary={"Subset Tool"} />
                    </ListItem>
                    <ListItem button onClick={handleSubgraphToolClick}>
                        <ListItemIcon>{<MailIcon />}</ListItemIcon>
                        <ListItemText primary={"Subgraph Tool"} />
                    </ListItem>
                    <ListItem button onClick={handleCompareToolClick}>
                        <ListItemIcon>{<MailIcon />}</ListItemIcon>
                        <ListItemText primary={"Compare Tool"} />
                    </ListItem>
                    {/*{['Subset Tool', 'Subgraph Tool', 'Compare Tool', 'Formal Tests'].map((text, index) => (*/}
                    {/*    <ListItem button key={text}>*/}
                    {/*        <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>*/}
                    {/*        <ListItemText primary={text} />*/}
                    {/*    </ListItem>*/}
                    {/*))}*/}
                </List>
                <Divider />
                <List>
                    {['Settings',].map((text, index) => (
                        <ListItem button key={text}>
                            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            <Dialog
                fullWidth
                maxWidth="md"
                open={sentenceOpen}
                onClose={handleSentenceClose}
            >
                <DialogTitle>
                    Select a sentence
                </DialogTitle>
                <DialogContent>
                    <SentenceList closeSelectSentence={handleSentenceClose}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSentenceClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth="md"
                open={subsetDialogOpen}
                onClose={handleSubsetDialogClose}
            >
                <DialogTitle>
                    Subset Tool
                </DialogTitle>
                <DialogContent>
                    <Grid
                        className={classes.rootJustWidth}
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                        spacing={2}

                    >
                        <Grid item xs={6} className={classes.body}>
                            <Card className={classes.body} variant="outlined">
                                <CardContent className={classes.body} >
                                    <Typography
                                        className={classes.title}
                                        color="textPrimary"
                                        gutterBottom
                                    >
                                        About the tool:
                                        {/*<IconButton aria-label="Display subset information button" color={"secondary"}*/}
                                        {/*            onClick={() => handleInfoClick("display subset tool")}>*/}
                                        {/*    <InfoIcon/>*/}
                                        {/*</IconButton>*/}
                                    </Typography>
                                    <Typography variant="body2" color="textPrimary">
                                        Select a node on the graph displayed in the visualization area to
                                        see the corresponding subset of the graph.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} style={{height: "100%"}}>
                            <Card className={classes.body} variant="outlined">
                                <CardContent>
                                    <DisplaySubsetTool/>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubsetDialogClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth="md"
                open={subgraphDialogOpen}
                onClose={handleSubgraphDialogClose}
            >
                <DialogTitle>
                    Subgraph Tool
                </DialogTitle>
                <DialogContent>
                    <Grid
                        className={classes.rootJustWidth}
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <Grid item xs={6} className={classes.body}>
                            <Card className={classes.body} variant="outlined">
                                <CardContent className={classes.body} >
                                    <Typography
                                        className={classes.title}
                                        color="textPrimary"
                                        gutterBottom
                                    >
                                        About the tool:
                                        {/*<IconButton aria-label="Display subset information button" color={"secondary"}*/}
                                        {/*            onClick={() => handleInfoClick("display subset tool")}>*/}
                                        {/*    <InfoIcon/>*/}
                                        {/*</IconButton>*/}
                                    </Typography>
                                    <Typography variant="body2" color="textPrimary">
                                        Search for a sub-graph pattern using the nodes and labels of the current
                                        graph.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} style={{height: "100%"}}>
                            <Card className={classes.body} variant="outlined">
                                <CardContent>
                                    <SearchSubgraphPatternTool/>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSubgraphDialogClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullWidth
                maxWidth="md"
                open={compareDialogOpen}
                onClose={handleCompareToolDialogClose}
            >
                <DialogTitle>
                    Compare Tool
                </DialogTitle>
                <DialogContent>
                    <Grid
                        className={classes.rootJustWidth}
                        container
                        direction="row"
                        justify="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <Grid item xs={6} className={classes.body}>
                            <Card className={classes.body} variant="outlined">
                                <CardContent className={classes.body} >
                                    <Typography
                                        className={classes.title}
                                        color="textPrimary"
                                        gutterBottom
                                    >
                                        About the tool:
                                        {/*<IconButton aria-label="Display subset information button" color={"secondary"}*/}
                                        {/*            onClick={() => handleInfoClick("display subset tool")}>*/}
                                        {/*    <InfoIcon/>*/}
                                        {/*</IconButton>*/}
                                    </Typography>
                                    <Typography variant="body2" color="textPrimary">
                                        Click the button to compare the similarities and differences of any two
                                        graphs.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} style={{height: "100%"}}>
                            <Card className={classes.body} variant="outlined">
                                <CardContent>
                                    <CompareTwoGraphsTool/>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCompareToolDialogClose}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {state.selectedSentenceID === null ? (
                    state.dataSet === null ?
                        <div className={classes.graphDiv}>
                            <Card variant="outlined" style={{width:"100%", height:"100%"}}>
                                <CardContent style={{ height:"100%"}}>
                                    <div style={{display:"flex",justifyContent: "center",
                                        alignItems: "center", height:"100%"}}>
                                        <Typography variant="h6">
                                            Please
                                            upload a dataset
                                        </Typography>
                                    </div>

                                </CardContent>

                            </Card>
                        </div> :
                        <div className={classes.graphDiv}>
                            <Card variant="outlined" style={{width:"100%", height:"100%"}}>
                                <CardContent style={{ height:"100%"}}>
                                    <div style={{display:"flex",justifyContent: "center",
                                        alignItems: "center", height:"100%"}}>
                                        <Typography variant="h6">
                                            Please
                                            select a sentence
                                        </Typography>
                                    </div>

                                </CardContent>

                            </Card></div>
                ):(
                        <div className={classes.graphDiv}>
                            <ParentSize>
                                {parent => (
                                    <Graph
                                        width={parent.width}
                                        height={parent.height}
                                        graph={state.selectedSentenceVisualisation}
                                        adjacentLinks={determineAdjacentLinks(state.selectedSentenceVisualisation)}
                                        graphFormatCode={graphFormatCode}
                                    />
                                )}
                            </ParentSize>
                        </div>
                   )}
            </main>
        </div>
    );
}