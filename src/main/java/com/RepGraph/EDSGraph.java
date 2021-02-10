package com.RepGraph;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.*;

/**
 * The Graph class represents a single sentence which comprises of nodes, edges and tokens.
 */
public class EDSGraph extends AbstractGraph {


    /**
     * Default constructor for the Graph class.
     */
    public EDSGraph() {
        super();
    }

    public EDSGraph(String id, String source, String input, HashMap<String, Node> nodes, ArrayList<Token> tokens, ArrayList<Edge> edges, String top) {
        super(id, source, input, nodes, edges,tokens, top);

    }

    @JsonSetter("nodes")
    public void setNodes(ArrayList<Node> nodelist) {

        //Dont understand the CARG property thing
        for (Node n : nodelist) {
            if (n.getLabel().startsWith("_")){n.setSurface(true);}else{n.setSurface(false);}
            this.nodes.put(n.getId(), n);
        }
        populateTokens();
    }

}