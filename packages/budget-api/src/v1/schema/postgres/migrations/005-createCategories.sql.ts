export const migration005 = `
-- DDL generated by Postico 1.5.17
-- Not all database features are supported. Do not use for backup.

-- Table Definition ----------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
    guid character varying(36) PRIMARY KEY,
    budget_guid character varying(36) NOT NULL REFERENCES budgets(guid) ON DELETE CASCADE,
    label character varying(50) NOT NULL DEFAULT ''::character varying,
    "dateCreated" timestamp with time zone NOT NULL DEFAULT now(),
    "dateModified" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE items
    ADD category_guid character varying(36) REFERENCES category(guid);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS categories_pkey ON categories(guid text_ops,budget_guid text_ops);
`;
