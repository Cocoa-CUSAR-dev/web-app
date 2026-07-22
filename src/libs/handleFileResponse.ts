import "client-only";

async function handleFileResponseXlsx(response: Response) {
  try {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentDisposition = response.headers.get("Content-Disposition");
    let fileName = "exam-report.xlsx";

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        fileName = filenameMatch[1];
      }
    }

    const arrBuff = await response.arrayBuffer();
    const blob = new Blob([arrBuff], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName.includes("xlsx") ? fileName : fileName + ".xlsx";
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (err) {
    console.error(err);
  }
}

export { handleFileResponseXlsx };
