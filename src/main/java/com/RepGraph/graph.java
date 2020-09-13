/**
 * The graph class represents a single sentence which comprises of nodes, edges and tokens.
 * @since 29/08/2020
 */
package com.RepGraph;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.PriorityQueue;

public class graph {

    /**
     * The graph's ID number.
     */
    private String id;

    /**
     * The graph's source.
     */
    private String source;

    /**
     * The graph's input/sentence.
     */
    private String input;

    /**
     * An array list of the graph's nodes.
     */
    private ArrayList<node> nodes;

    /**
     * An array list of the graph's tokens.
     */
    private ArrayList<token> tokens;

    /**
     * An array list of the graph's edges.
     */
    private ArrayList<edge> edges;

    /**
     * Default constructor for the graph class.
     */
    public graph(){}

    /**
     * Fully parameterised constructor for the graph class.
     * @param id The graph's ID number.
     * @param source The graph's source.
     * @param input The graph's input/sentence.
     * @param nodes An array list of the graph's nodes.
     * @param tokens An array list of the graph's tokens.
     * @param edges An array list of the graph's edges.
     */
    public graph(String id, String source, String input, ArrayList<node> nodes, ArrayList<token> tokens, ArrayList<edge> edges){
        this.id = id;
        this.source= source;
        this.input = input;
        this.nodes = nodes;
        this.tokens = tokens;
        this.edges= edges;
    }

    /**
     * Getter method for the graph's ID number.
     * @return String The graph's ID number.
     */
    public String getId() {
        return id;
    }

    /**
     * Setter method for the graph's ID number.
     * @param id The graph's ID number.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Getter method for the graph's source.
     * @return String The graph's source.
     */
    public String getSource() {
        return source;
    }

    /**
     * Setter method for the graph's source.
     * @param source The graph's source.
     */
    public void setSource(String source) {
        this.source = source;
    }

    /**
     * Getter method for the graph's input.
     * @return String The graph's input.
     */
    public String getInput() {
        return input;
    }

    /**
     * Setter method for the graph's input.
     * @param input The graph's input.
     */
    public void setInput(String input) {
        this.input = input;
    }

    /**
     * Getter method for the graph's nodes.
     * @return ArrayList The graph's nodes.
     */
    public ArrayList<node> getNodes() {
        return nodes;
    }

    /**
     * Setter method for the graph's nodes.
     * @param nodes The graph's nodes.
     */
    public void setNodes(ArrayList<node> nodes) {
        this.nodes = nodes;
    }

    /**
     * Getter method for the graph's tokens.
     * @return ArrayList The graph's tokens.
     */
    public ArrayList<token> getTokens() {
        return tokens;
    }

    /**
     * Setter method for the graph's tokens.
     * @param tokens The graph's tokens.
     */
    public void setTokens(ArrayList<token> tokens) {
        this.tokens = tokens;
    }

    /**
     * Getter method for the graph's edges.
     * @return ArrayList The graph's edges.
     */
    public ArrayList<edge> getEdges() {
        return edges;
    }

    /**
     * Setter method for the graph's edges.
     * @param edges The graph's edges.
     */
    public void setEdges(ArrayList<edge> edges) {
        this.edges = edges;
    }

    /**
     * Analysis Tool for finding the longest path in the graph.
     * @return ArrayList The route of the longest path.
     */
    public ArrayList<Integer> findLongest(){

        setNodeNeighbours();

        //Default longest path set from node 0.
        ArrayList<Integer> longest = Dijkstra(0);

        ArrayList<Integer> temp;

        //Makes each node the start node and finds the longest overall path.
        for (int i =1; i<nodes.size();i++){
            temp = Dijkstra(i);

            if (temp.size() > longest.size()){
                longest = temp;
            }
        }

        //Reverses the path so that start node is first.
        ArrayList<Integer> reversed = new ArrayList<Integer>();
        for (int i = longest.size() - 1; i >= 0; i--) {
            reversed.add(longest.get(i));
        }

        return reversed;
    }

    /**
     * Assigns all the nodes in the graph their neighbouring nodes, which will be used for analysis.
     */
    public void setNodeNeighbours(){

        int source;
        int target;


        if (edges.size()!=0){
            //Graph has no edges
            return;
        }
        else{
            source = edges.get(0).getSource();
            if (nodes.get(source).getNodeNeighbours().size() != 0){
                //Node neighbours have already been set
                return;
            }
        }

        for (int i=1; i<edges.size();i++){
            source = edges.get(i).getSource();
            target = edges.get(i).getTarget();
            nodes.get(source).addNeighbour(target);
        }
    }

    /**
     * Finds the longest distance from a given start node to all the other nodes in the system and returns the path of the longest path.
     * @param startNode Number of the start node.
     * @return ArrayList The longest path available from the start node.
     */
    public ArrayList<Integer> Dijkstra(int startNode){

        ArrayList<Integer> path = new ArrayList<Integer>();

        //If the start node has no neighbours then stop performing the algorithm and return empty path.
        if (nodes.get(startNode).getNodeNeighbours().size()==0){
            return path;
        }


        ArrayList<Integer> nodesLeft = new ArrayList<Integer>(); //Nodes that are yet to be visited.

        ArrayList<Integer> dist = new ArrayList<Integer>(); //Each node's distance from start node. i.e. dist[3] is the 4th nodes distance from the start node.
        int[] prevNode = new int[nodes.size()]; //Each node's previous node in the path.

        //Add all nodes to the nodesLeft ArrayList and set their distance to max.
        for (int i = 0; i<nodes.size();i++){
            dist.add(Integer.MAX_VALUE);
            nodesLeft.add(i);
        }


        dist.set(startNode,0);
        int maxDistIndex = startNode;

        while (nodesLeft.size() > 0){ //While there are still nodes unchecked.

            //Finds the node in nodeLeft with the longest viable distance from the start node (i.e. longest path that isn't max).
            maxDistIndex = nodesLeft.get(0);
            for(int i = 1; i<nodesLeft.size(); i++){
                if (dist.get(nodesLeft.get(i)) < dist.get(maxDistIndex)){

                    maxDistIndex = nodesLeft.get(i);
                }
            }


            node currentNode = nodes.get(maxDistIndex);
            nodesLeft.remove(nodesLeft.indexOf(maxDistIndex));


            //Checks all of the chosen node's neighbours to see if their distances can be made longer (i.e. more negative and thus a further distance from the start node).
            for (int neighbourNodeID : currentNode.getNodeNeighbours()){
                int currentNodeID = currentNode.getId();
                if (dist.get(neighbourNodeID) > dist.get(currentNodeID) - 1){
                    dist.set(neighbourNodeID, dist.get(currentNodeID)  - 1); //Sets the neighbour node's distance to the current node's distance minus 1. (each edge has a cost of 1).
                    prevNode[neighbourNodeID] = currentNodeID; //Sets the neighbour node's previous node in the path.
                }
            }
        }

        //Finds node index with the longest viable path. (i.e. most negative distance)
        int max = 0;
        for (int i = 0; i<dist.size();i++){
            if (dist.get(max) > dist.get(i)){
                max = i;
            }
        }

        //Uses the prevNode ArrayList to find the path of the longest distance starting at the end node.
        path.add(max);
        int prev = prevNode[max];
        while (prev!=startNode){
            path.add(prev);
            prev = prevNode[prev];
        }
        path.add(startNode);

        return path;

    }
}
