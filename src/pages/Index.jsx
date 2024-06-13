import React, { useState } from "react";
import { FaPlus } from 'react-icons/fa';
import { Container, VStack, HStack, Box, Heading, Input, Button, Text, Textarea } from "@chakra-ui/react";
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
  const [newCardDetails, setNewCardDetails] = useState("");
  const [showInput, setShowInput] = useState({});
  const [editingCard, setEditingCard] = useState(null);

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

  const addCardToColumn = (columnId, newCardText, newCardDetails) => {
    if (newCardText.trim() === "") return;
    if (editingCard) {
      saveEditedCard();
      return;
    }
    const newCard = { id: `${new Date().getTime()}`, content: newCardText, details: newCardDetails };
    setColumns({
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: [...columns[columnId].items, newCard]
      }
    });
    setShowInput({ ...showInput, [columnId]: false });
    setNewCardText("");
    setNewCardDetails("");
  };

  const handleAddCardClick = (columnId) => {
    if (editingCard) {
      saveEditedCard();
    }
    setShowInput({ ...showInput, [columnId]: true });
    setEditingCard(null);
  };

  const handleCancelClick = (columnId) => {
    setShowInput({ ...showInput, [columnId]: false });
    setNewCardText("");
    setNewCardDetails("");
    setEditingCard(null);
  };

  const handleCardClick = (columnId, cardId) => {
    const card = columns[columnId].items.find(item => item.id === cardId);
    setEditingCard({ columnId, cardId, content: card.content, details: card.details });
    setShowInput({ ...showInput, [columnId]: true });
  };

  const handleCardContentChange = (e) => {
    setEditingCard({ ...editingCard, content: e.target.value });
  };

  const handleCardDetailsChange = (e) => {
    setEditingCard({ ...editingCard, details: e.target.value });
  };

  const saveEditedCard = () => {
    const { columnId, cardId, content, details } = editingCard;
    const updatedItems = columns[columnId].items.map(item => 
      item.id === cardId ? { ...item, content, details } : item
    );
    setColumns({
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: updatedItems
      }
    });
    setEditingCard(null);
    setShowInput({ ...showInput, [columnId]: false });
    setNewCardText("");
    setNewCardDetails("");
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setShowInput({});
  };

  return (
    <Container maxW="container.xl" p={4}>
      <VStack spacing={4}>
        <Heading>Task Board</Heading>
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
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md">{column.name}</Heading>
                    </HStack>
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
                            onClick={() => handleCardClick(columnId, item.id)}
                          >
                            {editingCard && editingCard.cardId === item.id ? (
                              <Box>
                                <Input
                                  value={editingCard.content}
                                  onChange={handleCardContentChange}
                                  mb={2}
                                />
                                <Textarea
                                  value={editingCard.details}
                                  onChange={handleCardDetailsChange}
                                  mb={2}
                                />
                                <HStack>
                                  <Button size="sm" onClick={saveEditedCard}>Save</Button>
                                  <Button size="sm" onClick={cancelEditing}>Cancel</Button>
                                </HStack>
                              </Box>
                            ) : (
                              <Box>
                                <Text>{item.content}</Text>
                                <Text fontSize="sm" color="gray.600">{item.details}</Text>
                              </Box>
                            )}
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {showInput[columnId] ? (
                      <Box mt={4}>
                        <Input
                          placeholder="Enter card title"
                          value={newCardText}
                          onChange={(e) => setNewCardText(e.target.value)}
                          mb={2}
                        />
                        <Textarea
                          placeholder="Enter card details"
                          value={newCardDetails}
                          onChange={(e) => setNewCardDetails(e.target.value)}
                          mb={2}
                        />
                        <HStack>
                          <Button size="sm" onClick={() => addCardToColumn(columnId, newCardText, newCardDetails)}>Add</Button>
                          <Button size="sm" onClick={() => handleCancelClick(columnId)}>Cancel</Button>
                        </HStack>
                      </Box>
                    ) : (
                      <Button leftIcon={<FaPlus />} colorScheme="blue" variant="outline" mt={4} onClick={() => handleAddCardClick(columnId)}>
                        Add Card
                      </Button>
                    )}
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