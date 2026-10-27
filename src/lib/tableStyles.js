/**
 * Shared theme for react-data-table-component.
 * Keeps every provider table visually identical to the rest of the design
 * system instead of each page declaring its own inline overrides.
 */
export const tableStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  headRow: {
    style: {
      backgroundColor: "var(--th-surface-sunken)",
      borderBottom: "1px solid var(--th-line)",
      minHeight: "44px",
    },
  },
  headCells: {
    style: {
      color: "var(--th-muted)",
      fontSize: "var(--th-fs-2xs)",
      fontWeight: "700",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      paddingLeft: "1.1rem",
      paddingRight: "1.1rem",
    },
  },
  cells: {
    style: {
      color: "var(--th-text)",
      fontSize: "var(--th-fs-sm)",
      paddingLeft: "1.1rem",
      paddingRight: "1.1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
    },
  },
  rows: {
    style: {
      borderBottomColor: "var(--th-line)",
      minHeight: "58px",
    },
    highlightOnHoverStyle: {
      backgroundColor: "var(--th-blue-50)",
      borderBottomColor: "var(--th-line)",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid var(--th-line)",
      color: "var(--th-muted)",
      fontSize: "var(--th-fs-sm)",
      minHeight: "52px",
    },
  },
  noData: {
    style: {
      color: "var(--th-muted)",
      padding: "2.5rem 1rem",
      fontSize: "var(--th-fs-sm)",
    },
  },
};

export default tableStyles;
