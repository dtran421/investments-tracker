export enum Channels {
    "IPC_EXAMPLE" = "ipc-example",
    "INITIALIZE_PORTFOLIO" = "initialize-portfolio"
}

export type Portfolio = {
    name: string;
    order: number;
};

export type DBSchema = {
    portfolios: Portfolio[];
};
