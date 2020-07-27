CREATE TABLE Raumbuch (
    Bauwerk TEXT,
    Bauwerkbezeichnung TEXT,
    Ebene TEXT,
    Raumnr TEXT,
    Nutzungsartbez TEXT,
    Nutzername TEXT,
    Kostentraeger TEXT,
    GueltigVon DATE,
    GueltigBis DATE
);

set datestyle=DMY;
\COPY Raumbuch FROM 'Raumbuch_minimal.csv' WITH CSV HEADER;

ALTER TABLE raumbuch ADD COLUMN raumid SERIAL PRIMARY KEY;
