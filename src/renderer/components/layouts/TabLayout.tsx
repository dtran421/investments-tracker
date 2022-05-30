import {
    Dispatch,
    ReactNode,
    MouseEvent,
    SetStateAction,
    useState
} from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult
} from "react-beautiful-dnd";
import _ from "lodash";

import MainLayout from "./MainLayout";

interface TabProps {
    label: string;
    idx: number;
    openTabs: string[];
    setOpenTabs: Dispatch<
        SetStateAction<[string[], "initial" | "open" | "close" | ""]>
    >;
    active: boolean;
    setActiveTab: Dispatch<SetStateAction<[string, number]>>;
    modifiedLayout: boolean;
    isDragging: boolean;
}

const Tab = ({
    label,
    idx,
    active,
    setActiveTab,
    openTabs,
    setOpenTabs,
    modifiedLayout,
    isDragging
}: TabProps) => {
    const closeTab = (ev: MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation();
        setOpenTabs([_.without(openTabs, label), "close"]);
    };

    return (
        <Draggable draggableId={label} index={idx}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    className={`flex items-center ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    } `}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className="relative group">
                        <div
                            role="button"
                            className={`flex justify-between ${
                                !active
                                    ? "text-neutral-300 hover:text-white"
                                    : "cursor-default"
                            } transition duration-100 ease-in space-x-6 px-3 py-2`}
                            onClick={() =>
                                !active && setActiveTab([label, idx])
                            }
                            onKeyPress={() =>
                                !active && setActiveTab([label, idx])
                            }
                            tabIndex={active ? -1 : 0}
                        >
                            <p className="flex items-center select-none bg-transparent focus:outline-none">
                                {label}
                            </p>
                            <button
                                type="button"
                                className="hover:bg-neutral-600/50 rounded-md transition duration-50 ease-linear p-1"
                                onClick={(ev: MouseEvent<HTMLButtonElement>) =>
                                    closeTab(ev)
                                }
                            >
                                <AiOutlineClose size={14} />
                            </button>
                        </div>
                        <div className="absolute bottom-0 w-full px-3">
                            <div
                                className={`border-b ${
                                    active
                                        ? "border-orange-500"
                                        : "border-transparent group-hover:border-neutral-300"
                                } transition duration-100 ease-linear`}
                            />
                        </div>
                    </div>
                    {(idx !== openTabs.length - 1 || modifiedLayout) && (
                        <div className="h-full flex items-center bg-neutral-800/70 py-2">
                            <div className="h-full border-r border-neutral-600" />
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

interface TabLayoutProps {
    tabs: string[];
    openTabs: string[];
    setOpenTabs: Dispatch<
        SetStateAction<[string[], "initial" | "open" | "close" | ""]>
    >;
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<[string, number]>>;
    activePage: string;
    children: ReactNode;
}

const TabLayout = ({
    tabs,
    openTabs,
    setOpenTabs,
    activeTab,
    setActiveTab,
    activePage,
    children
}: TabLayoutProps) => {
    const modifiedLayout = openTabs.length !== tabs.length;

    const [isDragging, toggleDragging] = useState(false);

    const handleDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.index === source.index) {
            return;
        }

        const newTabs = Array.from(openTabs);
        newTabs.splice(source.index, 1);
        newTabs.splice(destination.index, 0, draggableId);

        setOpenTabs([newTabs, ""]);
        toggleDragging(false);
    };

    return (
        <MainLayout {...{ activePage }}>
            <div className="w-full h-full flex flex-col">
                <div className="w-full flex bg-neutral-800/70 border-b border-neutral-700 px-2 pt-2">
                    <DragDropContext
                        onDragStart={() => toggleDragging(true)}
                        onDragEnd={handleDragEnd}
                    >
                        <Droppable droppableId="tabBar" direction="horizontal">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    className="flex"
                                    {...provided.droppableProps}
                                >
                                    {openTabs.map((tab, idx) => (
                                        <Tab
                                            key={tab}
                                            label={tab}
                                            active={activeTab === tab}
                                            {...{
                                                idx,
                                                setActiveTab,
                                                openTabs,
                                                setOpenTabs,
                                                modifiedLayout,
                                                isDragging
                                            }}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    {modifiedLayout && (
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="flex items-center text-orange-400 transition duration-100 ease-in space-x-1 rounded-lg px-2 py-1"
                                onClick={() =>
                                    setOpenTabs([
                                        [
                                            ...openTabs,
                                            _.first(
                                                _.without(tabs, ...openTabs)
                                            ) as string
                                        ],
                                        "open"
                                    ])
                                }
                            >
                                <AiOutlinePlus size={14} />
                                <span>View</span>
                            </button>
                        </div>
                    )}
                </div>
                {children}
            </div>
        </MainLayout>
    );
};

export default TabLayout;
