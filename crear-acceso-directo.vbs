' Script VBScript para crear acceso directo en el Escritorio
' Crea un acceso directo a actualizar.bat en el Escritorio de Windows

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtener rutas
DesktopPath = WshShell.SpecialFolders("Desktop")
ScriptPath = fso.GetParentFolderName(WScript.ScriptFullName)
BatchFile = ScriptPath & "\actualizar.bat"

' Verificar que existe el archivo .bat
If Not fso.FileExists(BatchFile) Then
    MsgBox "Error: No se encuentra actualizar.bat en " & ScriptPath, vbCritical, "Error"
    WScript.Quit 1
End If

' Crear acceso directo
Set ShortcutLink = WshShell.CreateShortcut(DesktopPath & "\Actualizar Apartamentos.lnk")
ShortcutLink.TargetPath = BatchFile
ShortcutLink.WorkingDirectory = ScriptPath
ShortcutLink.Description = "Actualizar sistema Apartamento Airbnb desde GitHub"
ShortcutLink.IconLocation = "%SystemRoot%\System32\shell32.dll,46"  ' Icono de carpeta con flecha
ShortcutLink.Save

' Mensaje de éxito
MsgBox "✓ Acceso directo creado exitosamente en el Escritorio!" & vbCrLf & vbCrLf & _
       "Nombre: Actualizar Apartamentos" & vbCrLf & _
       "Ubicación: " & DesktopPath, vbInformation, "Éxito"
