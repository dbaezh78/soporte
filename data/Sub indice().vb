Sub indice()
    Dim sheetdb As Worksheet
    Dim rowStart As Integer
    Dim colStart As Integer
    Dim currentRow As Integer
    Dim currentCol As Integer
    Const ULTIMA_FILA As Integer = 40 ' Límite inferior (fila 40)
    Const ULTIMA_COL As Integer = 8    ' Columna H (8)
    
    ' Desactivar actualizaciones
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual
    Application.EnableEvents = False
    
    ' Limpiar solo el área de enlaces (A2:H40)
    Sheets("Indice").Range("A2:H40").ClearContents
    
    ' Configurar inicio en A2
    rowStart = 2
    colStart = 1
    currentRow = rowStart
    currentCol = colStart
    
    For Each sheetdb In Worksheets
        If sheetdb.Name <> "Indice" Then
            ' Insertar enlace en la celda actual
            With Sheets("Indice").Cells(currentRow, currentCol)
                .Value = sheetdb.Name
                .Hyperlinks.Add Anchor:=.Cells, Address:="", SubAddress:="'" & sheetdb.Name & "'!A3"
                .Font.Name = "Comic Sans MS"
                .Font.Size = 16
                .Font.Color = RGB(255, 255, 255)
                .Interior.Color = RGB(0, 0, 0)
                .Font.Underline = xlUnderlineStyleNone
            End With
            
            ' Avanzar a la siguiente celda
            currentRow = currentRow + 1
            
            ' Verificar límites
            If currentRow > ULTIMA_FILA Then
                currentRow = rowStart
                currentCol = currentCol + 1
                ' Salir si superamos columna H
                If currentCol > ULTIMA_COL Then Exit For
            End If
        End If
    Next sheetdb
    
    ' Reactivar actualizaciones
    Application.ScreenUpdating = True
    Application.Calculation = xlCalculationAutomatic
    Application.EnableEvents = True
    
    
End Sub



' /---------------------------------------------

Sub Button_JS_Click()
    Dim hojaActual As Worksheet
    Dim rangoACopiar As Range
    Dim ultimaFila As Long

    ' Usar la hoja activa (donde está el botón)
    Set hojaActual = ActiveSheet
    ' Encontrar la última fila con datos en la columna L
    ultimaFila = hojaActual.Cells(hojaActual.Rows.Count, "L").End(xlUp).Row

    ' Definir el rango desde L2 hasta la última fila con datos
    If ultimaFila >= 2 Then
        Set rangoACopiar = hojaActual.Range("L2:L" & ultimaFila)
        rangoACopiar.Copy
    Else
        MsgBox "No hay datos para copiar en la columna L desde L2 en adelante.", vbExclamation
    End If
End Sub




'-----------------------------------
Function SumarE1HojaAnterior() As Variant
    ' Hace que la función se recalcule cada vez que hay un cambio en el libro.
    Application.Volatile

    Dim wsCurrent As Worksheet
    Dim wsPrevious As Worksheet
    Dim currentIndex As Long
    Dim valorActual As Variant
    Dim valorAnterior As Variant

    ' Establecer el manejo de errores para la función
    On Error GoTo ErrorHandler

    ' Obtener la hoja desde donde se llama la función
    Set wsCurrent = Application.Caller.Parent
    currentIndex = wsCurrent.Index

    ' *** Obtener el valor de E1 de la hoja actual ***
    On Error Resume Next ' Ignora errores temporalmente para leer la celda
    valorActual = wsCurrent.Range("H1").Value
    ' Normaliza el valor si es un error o está vacío
    If IsError(valorActual) Then valorActual = 0
    If IsEmpty(valorActual) Then valorActual = 0
    On Error GoTo ErrorHandler ' Restaura el manejo de errores general

    ' *** Lógica para la hoja anterior ***
    If currentIndex > 1 Then
        Set wsPrevious = ThisWorkbook.Sheets(currentIndex - 1)

        ' Obtener el valor de E1 de la hoja anterior
        On Error Resume Next ' Ignora errores temporalmente para leer la celda
        valorAnterior = wsPrevious.Range("C1").Value
        ' Normaliza el valor si es un error o está vacío
        If IsError(valorAnterior) Then valorAnterior = 0
        If IsEmpty(valorAnterior) Then valorAnterior = 0
        On Error GoTo ErrorHandler ' Restaura el manejo de errores general

        ' Sumar los valores, asegurándose de que son numéricos
        SumarE1HojaAnterior = CDbl(valorActual) + CDbl(valorAnterior)
    Else
        ' Si es la primera hoja, solo devuelve el valor de E1 de la hoja actual
        SumarE1HojaAnterior = CDbl(valorActual)
    End If

    Exit Function ' Sale de la función si todo va bien

ErrorHandler:
    ' Si ocurre cualquier otro error no manejado, devuelve un error #¡VALOR!
    SumarE1HojaAnterior = CVErr(xlErrValue)
End Function
