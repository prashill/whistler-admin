import React, {useState, useEffect} from 'react';
import {
  Box,
  Toolbar,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Backdrop,
  CircularProgress,
  Alert
} from '@mui/material';
import AWS from 'aws-sdk';

AWS.config.update({
  region: 'eu-west-1',
  accessKeyId: 'AKIAQKGGXQ77WPF5CXCV',
  secretAccessKey: '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',
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
  
const ExTable = () => {

  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const params = {
      TableName: 'profile_table',
    };
    try {
      const data = await dynamodb.scan(params).promise();
      const filteredItems = data.Items.filter(item => 
        !item.username.startsWith('signinwithapple') && !item.username.startsWith('default') && !item.username.startsWith('google') 
      );

      setUser(filteredItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    setLoading(false);
  };

  const handleValidateUser = async(userId, action) =>{
    let newStatus = action
    await updateUserValidationStatus(userId, newStatus)
  }

  const updateUserValidationStatus = async (user_id, newStatus) => {
    setLoading(true);

    const params = {
      TableName: 'profile_table',
      Key: {
        user_id: user_id,
      },
      UpdateExpression: 'set validation_status = :newStatus',
      ExpressionAttributeValues: {
        ':newStatus': newStatus,
      },
      ReturnValues: 'UPDATED_NEW',
    };
  
    try {
      const result = await dynamodb.update(params).promise();
      console.log('Update succeeded:', result);
      <Alert severity="success">Successfully validated user.</Alert>
      fetchData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
    setLoading(false);
  };
  
  const filteredUsers = user.filter(item =>
    item.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.last_name?.toLowerCase().includes(searchQuery.toLowerCase())  ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={loading}
    >
      <CircularProgress color="inherit" />
    </Backdrop>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#ffffff',
          p: 4,
          transition: 'margin 0.3s ease',
        }}
      >
        <Toolbar />
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <TextField
            fullWidth
            label="Search user"
            placeholder="Search by First Name or Last Name in Lower case"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            />
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Full Name & Email</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Verify User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                      {user.first_name} {user.last_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.validation_status}</TableCell>
                    <TableCell align="right">
                      <Button onClick={() => handleValidateUser(user.user_id, 'approved')} variant="text" color="primary">
                        Verify
                      </Button>
                      <Button onClick={() => handleValidateUser(user.user_id, 'pending')} variant="text" color="warning">
                        Revoke 
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </>
  )
}

export default ExTable
