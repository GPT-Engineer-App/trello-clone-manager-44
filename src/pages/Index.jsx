import React, { useState } from "react";
import { Container, VStack, HStack, Box, Heading, Input, Button, Text } from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialColumns = {
  backlog: {
    name: "Backlog",
    items: []
  },
  todo: {
    name: "To-do",
    items: []
  },
  doing: {
    name: "Doing",
    items: []
  },
  readyForTesting: {
    name: "Ready for testing",
    items: []
  },
  testing: {
    name: "Testing",
    items: []
  },
  done: {
    name: "Done",
    items: []
  },
  cancelled: {
    name: "Cancelled",
    items: []
  }
};

const Index = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [newCardText, setNewCardText] = useState("");

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
  };

  const addCard = () => {
    if (newCardText.trim() === "") return;
    const newCard = { id: `${new Date().getTime()}`, content: newCardText };
    setColumns({
      ...columns,
      backlog: {
        ...columns.backlog,
        items: [...columns.backlog.items, newCard]
      }
    });
    setNewCardText("");
  };

  return (
    <Container maxW="container.xl" p={4}>
      <VStack spacing={4}>
        <Heading>Trello Clone Board</Heading>
        <HStack>
          <Input
            placeholder="Enter new card text"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
          />
          <Button onClick={addCard}>Add Card</Button>
        </HStack>
        <DragDropContext onDragEnd={onDragEnd}>
          <HStack spacing={4} align="start">
            {Object.entries(columns).map(([columnId, column], index) => (
              <Droppable key={columnId} droppableId={columnId}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    bg={snapshot.isDraggingOver ? "gray.200" : "gray.100"}
                    p={4}
                    rounded="md"
                    minW="200px"
                    maxH="500px"
                    overflowY="auto"
                  >
                    <Heading size="md" mb={4}>{column.name}</Heading>
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            p={2}
                            mb={2}
                            bg={snapshot.isDragging ? "blue.200" : "blue.100"}
                            rounded="md"
                          >
                            <Text>{item.content}</Text>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            ))}
          </HStack>
        </DragDropContext>
      </VStack>
    </Container>
  );
};

export default Index;