import * as React from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#b4ecfe",
    color: "black",
    fontFamily: "Open Sans",
    fontSize: 20,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#26A3CA",
  },
  "&:nth-of-type(even)": { backgroundColor: "#35aed3" },
  "td, th": {
    border: 0,
  },
}));

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export default function CustomTable({details}) {
  return (
    <TableContainer component={Paper} sx={{ marginTop: "1em" }}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ border: "1px solid #FFFFFF33" }}>
              Wallet
            </StyledTableCell>
            <StyledTableCell
              sx={{ border: "1px solid #FFFFFF33" }}
              align="left"
            >
              No. of Tickets
            </StyledTableCell>
            <StyledTableCell align="left">Result</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.name}>
              <StyledTableCell
                style={{ border: "1px solid #FFFFFF33" }}
                component="th"
                width={"50%"}
                scope="row"
              >
                {row.name}
              </StyledTableCell>
              <StyledTableCell
                style={{ border: "1px solid #FFFFFF33" }}
                align="left"
              >
                {row.calories}
              </StyledTableCell>
              <StyledTableCell align="left">{row.fat}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
