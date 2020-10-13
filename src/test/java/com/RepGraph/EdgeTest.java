package com.RepGraph;

import org.junit.Test;

import java.lang.reflect.Field;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertTrue;
import static org.springframework.test.util.AssertionErrors.assertEquals;

public class EdgeTest {

    @Test
    public void test_constructor_CreatesAndAssignsMemberVariables() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge(3, 5, "test", "postTest");

        final Field source = e.getClass().getDeclaredField("source");
        source.setAccessible(true);

        final Field target = e.getClass().getDeclaredField("target");
        target.setAccessible(true);

        final Field label = e.getClass().getDeclaredField("label");
        label.setAccessible(true);

        final Field postlabel = e.getClass().getDeclaredField("postLabel");
        postlabel.setAccessible(true);

        assertEquals("source value was not assigned properly in constructor", source.get(e), 3);
        assertEquals("target value was not assigned properly in constructor", target.get(e), 5);
        assertEquals("label value was not assigned properly in constructor", label.get(e), "test");
        assertEquals("postlabel value was not assigned properly in constructor", postlabel.get(e), "postTest");

    }

    @Test
    public void test_CopyConstructor_CreatesAndAssignsMemberVariablesFromEdge() throws NoSuchFieldException, IllegalAccessException {

        final edge copy = new edge(3, 5, "test", "postTest");

        final edge e = new edge(copy);

        final Field source = e.getClass().getDeclaredField("source");
        source.setAccessible(true);

        final Field target = e.getClass().getDeclaredField("target");
        target.setAccessible(true);

        final Field label = e.getClass().getDeclaredField("label");
        label.setAccessible(true);

        final Field postlabel = e.getClass().getDeclaredField("postLabel");
        postlabel.setAccessible(true);

        assertEquals("source value was not assigned properly in the copy constructor", source.get(e), 3);
        assertEquals("target value was not assigned properly in the copy constructor", target.get(e), 5);
        assertEquals("label value was not assigned properly in constructor", label.get(e), "test");
        assertEquals("postlabel value was not assigned properly in the copy constructor", postlabel.get(e), "postTest");

    }

    @Test
    public void test_getSource_GetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        //Set Field not using setter
        final Field field = e.getClass().getDeclaredField("source");
        field.setAccessible(true);
        field.set(e, 3);


        final int result = e.getSource();

        //then
        assertEquals("Source was not retrieved properly", result, 3);

    }


    @Test
    public void test_setSource_SetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        e.setSource(3);

        //get value not using getter
        final Field field = e.getClass().getDeclaredField("source");
        field.setAccessible(true);
        assertEquals("Source was not set properly", field.get(e), 3);
    }


    @Test
    public void test_getTarget_GetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        //Set Field not using setter
        final Field field = e.getClass().getDeclaredField("target");
        field.setAccessible(true);
        field.set(e, 3);


        final int result = e.getTarget();

        //then
        assertEquals("Target was not retrieved properly", result, 3);

    }


    @Test
    public void test_setTarget_SetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        e.setTarget(3);

        //get value not using getter
        final Field field = e.getClass().getDeclaredField("target");
        field.setAccessible(true);

        assertEquals("Target was not set properly", field.get(e), 3);
    }


    @Test
    public void test_getLabel_GetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        //Set Field not using setter
        final Field field = e.getClass().getDeclaredField("label");
        field.setAccessible(true);
        field.set(e, "test");


        final String result = e.getLabel();

        //then
        assertEquals("Label was not retrieved properly", result, "test");

    }


    @Test
    public void test_setLabel_SetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        e.setLabel("test");

        //get value not using getter
        final Field field = e.getClass().getDeclaredField("label");
        field.setAccessible(true);
        assertEquals("Label was not set properly", field.get(e), "test");
    }


    @Test
    public void test_getPostLabel_GetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        //Set Field not using setter
        final Field field = e.getClass().getDeclaredField("postLabel");
        field.setAccessible(true);
        field.set(e, "test");


        final String result = e.getPostLabel();

        //then
        assertEquals("PostLabel was not retrieved properly", result, "test");

    }


    @Test
    public void test_setPostLabel_SetsValueCorrectly() throws NoSuchFieldException, IllegalAccessException {

        final edge e = new edge();

        e.setPostLabel("test");

        //get value not using getter
        final Field field = e.getClass().getDeclaredField("postLabel");
        field.setAccessible(true);
        assertEquals("Post Label was not set properly", field.get(e), "test");
    }

    @Test
    public void test_equal_TwoEdgesWithDifferentValues() {

        final edge e1 = new edge(0,2, "testLabel", "testPostLabel");
        final edge e2 = new edge(0,3, "test3Label", "test2PostLabel");

        assertFalse("Equals does not work with two edges with different values.", e1.equals(e2));
    }

    @Test
    public void test_equal_IdenticalEdgesWithSameValues() {

        final edge e1 = new edge(0,2, "testLabel", "testPostLabel");
        final edge e2 = new edge(0,2, "testLabel", "testPostLabel");

        assertTrue("Equals does not work with two identical edges with the same values.", e1.equals(e2));
    }

    @Test
    public void test_equal_TwoObjectsOfDifferentClasses() {

        final edge e1 = new edge(0,2, "testLabel", "testPostLabel");

        assertFalse("Equals does not work with two objects of different classes", e1.equals(new anchors(0, 1)));
    }

    @Test
    public void test_equal_EqualToItself() {

        final edge e1 = new edge(0,2, "testLabel", "testPostLabel");

        assertTrue("Equals does not work with an edge equalling itself.", e1.equals(e1));
    }


}
