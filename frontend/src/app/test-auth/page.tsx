"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function TestAuthPage() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  
  const handleLogin = async () => {
    try {
      setLoginError("");
      await login(username, password);
    } catch (error: any) {
      setLoginError(error.message);
    }
  };

  const testTokenValidity = async () => {
    try {
      const response = await fetch('http://localhost:8181/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Token test response:', response.status, await response.text());
    } catch (error) {
      console.error('Token test error:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.username : 'None'}</p>
            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'None'}</p>
          </div>
          
          {!isAuthenticated ? (
            <div className="space-y-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border rounded"
              />
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
              {loginError && (
                <p className="text-red-500">{loginError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Button onClick={testTokenValidity} className="w-full">
                Test Token Validity
              </Button>
              <Button onClick={logout} variant="outline" className="w-full">
                Logout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
