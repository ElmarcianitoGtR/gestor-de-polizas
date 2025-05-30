import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const ApiDocumentation: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Documentación del Sistema
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Accede a la documentación técnica completa del sistema contable
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-blue-800">
              Documentación API
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-blue-700">
              Documentación completa de todos los endpoints, modelos de datos y
              guías de integración para la API FastAPI.
            </p>
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() =>
                window.open(
                  "https://github.com/ElmarcianitoGtR/gestor-de-polizas/blob/main/API_DOCUMENTATION.md",
                  "_blank"
                )
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver Documentación API
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-500 rounded-full w-16 h-16 flex items-center justify-center">
              <Github className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold text-green-800">
              Repositorio GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-green-700">
              Código fuente completo, instrucciones de instalación y
              documentación adicional en el repositorio oficial.
            </p>
            <Button
              className="w-full bg-green-500 hover:bg-green-600"
              onClick={() =>
                window.open(
                  "https://github.com/ElmarcianitoGtR/gestor-de-polizas/",
                  "_blank"
                )
              }
            >
              <Github className="mr-2 h-4 w-4" />
              Ver en GitHub
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 text-center">
            Estado de Conexión del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Detección Automática de API
            </h3>
            <p className="text-blue-700">
              El sistema detecta automáticamente si la API FastAPI está
              disponible en <code>http://localhost:8000</code> y se conecta
              automáticamente. Si no está disponible, funciona en modo local.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                ✅ Modo API Activo
              </h4>
              <p className="text-green-700 text-sm">
                Conectado a la API - Los datos se sincronizan con la base de
                datos del servidor.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Modo Local Activo
              </h4>
              <p className="text-yellow-700 text-sm">
                API no disponible - Los datos se almacenan localmente en el
                navegador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocumentation;
