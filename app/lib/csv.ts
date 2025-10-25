export const exportTableToCSV = (
  csvString: string,
  filename = "default.csv"
) => {
  const csvFile = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(csvFile);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
