import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useTheme } from "../../context/ThemeContext";
import useChat from "../../modules/chat/hooks/useChat";

// --- Styled Components --- //

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  background: ${(props) => props.theme.background.card};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
  overflow: hidden;
  font-family: inherit;
  box-shadow: ${(props) => props.theme.shadow};
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 14px 16px;
  background: none;
  border: none;
  border-bottom: 3px solid ${(props) => (props.$active ? props.theme.primary : "transparent")};
  color: ${(props) => (props.$active ? props.theme.primary : props.theme.text.secondary)};
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => props.theme.background.main};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: ${(props) => props.theme.background.main};
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// -- Chat Bubble Styles -- //

const BubbleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isMine ? "flex-end" : "flex-start")};
  margin-bottom: 8px;
`;

const BubbleInfo = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 4px;
`;

const BubbleCard = styled.div`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  position: relative;
  background: ${(props) => {
    if (props.$isPrivate) return props.theme.name === 'dark' ? 'rgba(147, 51, 234, 0.2)' : "#f3e8ff"; // Purple
    return props.$isMine ? props.theme.primary : props.theme.background.card;
  }};
  color: ${(props) => {
    if (props.$isPrivate) return props.theme.name === 'dark' ? '#d8b4fe' : "#6b21a8";
    return props.$isMine ? "#ffffff" : props.theme.text.primary;
  }};
  border: ${(props) =>
    !props.$isMine && !props.$isPrivate ? `1px solid ${props.theme.border}` : "none"};
  border-bottom-right-radius: ${(props) => (props.$isMine ? "4px" : "12px")};
  border-bottom-left-radius: ${(props) => (!props.$isMine ? "4px" : "12px")};
`;

const PrivateBadge = styled.span`
  display: inline-block;
  font-size: 0.65rem;
  background: #9333ea;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
`;

const HiddenNotice = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.text.secondary};
  text-align: center;
  padding: 12px;
  background: ${(props) => props.theme.primaryLight};
  border-radius: 6px;
  margin: 10px 0;
`;

// -- Input Area Styles -- //

const InputContainer = styled.div`
  padding: 16px;
  background: ${(props) => props.theme.background.card};
  border-top: 1px solid ${(props) => props.theme.border};
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  min-height: 48px;
  max-height: 120px;
  resize: none;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.border};
  background: ${(props) => props.theme.inputBg || props.theme.background.main};
  color: ${(props) => props.theme.text.primary};
  font-family: inherit;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary};
  }
`;

const SendButton = styled.button`
  height: 48px;
  padding: 0 24px;
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background: ${(props) => props.theme.primaryHover};
  }
`;

const ToolsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: ${(props) => props.theme.text.secondary};
  cursor: pointer;
`;

// -- History Timeline Styles -- //

const TimelineItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px dashed #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
`;

const TimelineDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => (props.$isPrivate ? "#9333ea" : props.theme.primary)};
  margin-top: 4px;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${(props) => props.theme.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimelineMeta = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-top: 4px;
`;

// --- Main Component --- //
const ChatPanel = ({ appointmentId }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("chat");
  const [inputText, setInputText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const scrollRef = useRef(null);

  const {
    notes,
    hiddenPrivateCount,
    loading,
    submitting,
    addNote,
    userRole,
    userId,
  } = useChat(appointmentId);

  const canMarkPrivate = userRole !== "NURSE";

  // Auto-scroll to bottom of chat when notes update
  useEffect(() => {
    if (activeTab === "chat" && scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [notes, activeTab]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    addNote(inputText, isPrivate);
    setInputText("");
    if (canMarkPrivate) setIsPrivate(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container>
      <Tabs>
        <Tab
          $active={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        >
          Notes & Chat
        </Tab>
        <Tab
          $active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          History
        </Tab>
      </Tabs>

      <ContentArea>
        {activeTab === "chat" && (
          <>
            <ScrollArea ref={scrollRef}>
              {loading && notes.length === 0 && <p>Loading...</p>}
              
              {hiddenPrivateCount > 0 && (
                <HiddenNotice>
                  ⚠️ {hiddenPrivateCount} private note(s) are hidden based on your role.
                </HiddenNotice>
              )}

              {notes.map((note) => {
                const isMine = note.user_id === userId;
                const isNotePrivate = parseInt(note.is_private) === 1;

                return (
                  <BubbleWrapper key={note.id} $isMine={isMine}>
                    <BubbleInfo>
                      {note.user_name} ({note.role_name}) • {formatDate(note.created_at)}
                    </BubbleInfo>
                    <BubbleCard $isMine={isMine} $isPrivate={isNotePrivate}>
                      {note.note}
                      {isNotePrivate && <PrivateBadge>Private</PrivateBadge>}
                    </BubbleCard>
                  </BubbleWrapper>
                );
              })}
            </ScrollArea>

            <InputContainer>
              <InputRow>
                <StyledTextarea
                  placeholder="Type a note... (Enter to send, Shift+Enter for newline)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={submitting}
                />
                <SendButton onClick={handleSend} disabled={submitting || !inputText.trim()}>
                  {submitting ? "Sending..." : "Send"}
                </SendButton>
              </InputRow>
              <ToolsRow>
                {canMarkPrivate ? (
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      disabled={submitting}
                    />
                    Mark as Private Note
                  </CheckboxLabel>
                ) : (
                  <span></span> // Empty spacer for alignment
                )}
              </ToolsRow>
            </InputContainer>
          </>
        )}

        {activeTab === "history" && (
          <ScrollArea>
            <h4>Audit Trail</h4>
            {notes.length === 0 && <p>No events recorded.</p>}
            {notes.map((note) => {
              const isNotePrivate = parseInt(note.is_private) === 1;
              return (
                <TimelineItem key={note.id}>
                  <TimelineDot $isPrivate={isNotePrivate} />
                  <TimelineContent>
                    <TimelineTitle>
                      {isNotePrivate ? "Private Note Added" : "Note Added"}
                      {isNotePrivate && <PrivateBadge>Private</PrivateBadge>}
                    </TimelineTitle>
                    <TimelineMeta>
                      By {note.user_name} ({note.role_name}) • {formatFullDate(note.created_at)}
                    </TimelineMeta>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </ScrollArea>
        )}
      </ContentArea>
    </Container>
  );
};

export default ChatPanel;
