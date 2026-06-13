"use client";
import { FiCopy } from "react-icons/fi";
import {
  useState,
  useEffect,
  useRef
} from "react";
import ReactMarkdown from "react-markdown";
import { IoArrowUp } from "react-icons/io5";
import { Prism as SyntaxHighlighter }
from "react-syntax-highlighter";
import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiMenu }
from "react-icons/fi";
  type Message = {

    role:
      "user"
      | "assistant";

    content: string;

  };
  type Chat = {
    id: string;
    title: string;
    messages: Message[];
  };
export default function Home() {

  const [message, setMessage] =
    useState("");

const [messages,
  setMessages] =
  useState<Message[]>([]);
  const [chats, setChats] =
    useState<Chat[]>([]);

  const [currentChatId,
    setCurrentChatId] =
    useState<string | null>(null);
  const [loading, setLoading] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [menuOpen, setMenuOpen] =
    useState<string | null>(null);

    useEffect(() => {

      const closeMenu = (e: MouseEvent) => {

        const target =
          e.target as HTMLElement;

        if (

          !target.closest(".menuBtn") &&

          !target.closest(".dropdown")

        ) {

          setMenuOpen(null);

        }

      };

      document.addEventListener(
        "click",
        closeMenu
      );

      return () =>
        document.removeEventListener(
          "click",
          closeMenu
        );

    }, []);
  const [file, setFile] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState("");
    useEffect(() => {

      if (!file) {

        setPreviewUrl("");

        return;

      }

      const url =
        URL.createObjectURL(file);

      setPreviewUrl(url);

      return () =>
        URL.revokeObjectURL(url);

    }, [file]);

    useEffect(() => {

      const savedChats =
        localStorage.getItem(
          "fsociety-chats"
        );

      if(savedChats){

        setChats(
          JSON.parse(savedChats)
        );

      }

    }, []);
    useEffect(() => {

      localStorage.setItem(
        "fsociety-chats",
        JSON.stringify(chats)
      );

    }, [chats]);
    useEffect(() => {

      if (chats.length === 0)
        return;

      const activeId =
        localStorage.getItem(
          "active-chat"
        );

      if (!activeId) return;

      const activeChat =
        chats.find(
          chat => chat.id === activeId
        );

      if (activeChat) {

        setCurrentChatId(activeId);

        setMessages(
          activeChat.messages
        );

      }

    }, [chats]);
  const chatRef =
    useRef<HTMLDivElement>(null);
    useEffect(() => {
      chatRef.current?.scrollTo({
        top:
          chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, [messages]);

  const handleRenameChat = (
    id: string
  ) => {

    const newTitle =
      prompt("Rename chat");

    if (!newTitle?.trim())
      return;

    setChats(prev =>
      prev.map(chat =>
        chat.id === id
          ? {
              ...chat,
              title: newTitle,
            }
          : chat
      )
    );
  };

  const handleDeleteChat = (
    id: string
  ) => {

    const ok =
      window.confirm(
        "Delete this chat?"
      );

    if (!ok) return;

    setChats(prev =>
      prev.filter(
        chat => chat.id !== id
      )
    );

    if (
      currentChatId === id
    ) {

      setCurrentChatId(null);

      setMessages([]);

      localStorage.removeItem(
        "active-chat"
      );

    }

  };
    const handleSend = async () => {

      if (loading) return;

      if (!message.trim() && !file)
        return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const updatedMessages: Message[] = [
      ...messages,
      userMessage,
    ];


    if(currentChatId){

      setChats(prev =>

        prev.map(chat =>

          chat.id === currentChatId

          ? {
              ...chat,
              messages: updatedMessages,
            }

          : chat

        )

      );

    }



    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {

      const formData = new FormData();

      formData.append(
        "messages",
        JSON.stringify(updatedMessages)
      );

      if (file) {
        formData.append(
          "file",
          file
        );
      }

      const res = await fetch(
        "/api/chat",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      const finalMessages: Message[] = [

        ...updatedMessages,

        {
          role: "assistant",
          content: data.reply,
        },

      ];

      setMessages(
        finalMessages
      );

    if(currentChatId){

      setChats(prev =>

        prev.map(chat =>

          chat.id === currentChatId

          ? {

              ...chat,

              title:
                chat.title === "New Chat"
                  ? updatedMessages[0]?.content?.slice(0,30)
                  : chat.title,

              messages: finalMessages,

            }

          : chat

        )

      );

    }
    setFile(null);
    } catch (error) {

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Error connecting to AI",
        },
      ]);

    }

    setLoading(false);
  };
  return (
    <div className="app">
      <aside
        className={
          sidebarOpen
            ? "sidebar open"
            : "sidebar"
        }
      >
        <div className="logo">
          <h1>FUCK SOCIETY</h1>
          <p>WE ARE FINALLY AWAKE</p>
        </div>

        <button
          className="newChat"
          onClick={() => {

            const id =
              Date.now().toString();
            const newChat: Chat = {

              id,

              title: "New Chat",

              messages: [],

            };

            setChats(prev => [
              newChat,
              ...prev,
            ]);

            setCurrentChatId(id);

            localStorage.setItem(
              "active-chat",
              id
            );

            setMessages([]);
            setMessage("");
            setFile(null);
            setSidebarOpen(false);
          }}
        >
          + NEW CHAT
        </button>

        <div className="history">
          <h3>TODAY</h3>

        {chats.map((chat) => (

        <div
          key={chat.id}
          className={
            currentChatId === chat.id
              ? "chatItem activeChat"
              : "chatItem"
          }
          onClick={() => {

            setCurrentChatId(chat.id);

            localStorage.setItem(
              "active-chat",
              chat.id
            );

            setMessages(chat.messages);

            setSidebarOpen(false);

          }}

        >

        <div className="chatRow">

          <span className="chatTitle">
            {chat.title}
          </span>

          <button
            className="menuBtn"
            onClick={(e) => {

              e.stopPropagation();

              setMenuOpen(
                menuOpen === chat.id
                  ? null
                  : chat.id
              );

            }}
          >
            ⋯
          </button>

          {menuOpen === chat.id && (

            <div className="dropdown">

              <button
                onClick={(e) => {

                  e.stopPropagation();

                  handleRenameChat(chat.id);

                  setMenuOpen(null);

                }}
              >
                Rename
              </button>

              <button
                onClick={(e) => {

                  e.stopPropagation();

                  handleDeleteChat(chat.id);

                  setMenuOpen(null);

                }}
              >
                Delete
              </button>

            </div>

          )}


          </div>

        </div>

        ))}

        </div>

        <div className="footerMenu">
          <div>📎 Files</div>
          <div>⚙ Settings</div>
          <div>ℹ About</div>
        </div>
      </aside>

      {sidebarOpen && (

        <div
          className="overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}



      <main className="main">
        <div className="header">
        <button
          className="mobileMenuBtn"
          onClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
        >
          <FiMenu />
        </button>
          <h1>FUCK SOCIETY</h1>
          <p>CONTROL IS AN ILLUSION</p>
        </div>

        <div
          ref={chatRef}
          className="chatContainer"
        >

          {messages.length === 0 && (
            <div className="aiMessage">
              Welcome to FSOCIETY AI.
              <br />
              Ask me anything.
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={
                msg.role === "user"
                  ? "userMessage"
                  : "aiMessage"
              }
            >
            {msg.role === "assistant" && (

              <button
                className="copyBtn"
                onClick={() =>
                  navigator.clipboard.writeText(
                    msg.content
                  )
                }
              >
                <FiCopy />
              </button>
            )}
              <ReactMarkdown
                components={{
                  code(props: any) {

                    const {
                      children,
                      className,
                    } = props;

                    const match =
                      /language-(\w+)/.exec(
                        className || ""
                      );

                  return match ? (

                    <div className="codeWrapper">

                      <button
                        className="codeCopyBtn"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            String(children)
                          )
                        }
                      >
                        <FiCopy />
                      </button>

                      <SyntaxHighlighter
                        language={match[1]}
                        style={oneDark as any}
                        PreTag="div"
                      >
                        {String(children)}
                      </SyntaxHighlighter>

                    </div>

                  ) : (
                   
                      <code className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          ))}

          {loading && (
            <div className="aiMessage">

              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>
          )}

        </div>
        {file && (
          <div className="filePreview">

          <img
            src={previewUrl}
            alt="preview"
          />

            <p>{file.name}</p>

          </div>
        )}

        <div className="inputContainer">

          <input
            type="file"
            id="fileInput"
            hidden
            onChange={(e) =>
              setFile(
                e.target.files?.[0] || null
              )
            }
          />

          <button
            className="iconBtn"
            onClick={() =>
              document
                .getElementById("fileInput")
                ?.click()
            }
          >
            +
          </button>

          <div className="promptWrapper">

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {

                  e.preventDefault();

                  handleSend();

                }

              }}
              placeholder="Ask anything..."
            />

            <button
              className="sendBtn"
              onClick={handleSend}
              disabled={loading}
            >
              <IoArrowUp />
            </button>

          </div>

        </div>
      </main>
    </div>
  );
}