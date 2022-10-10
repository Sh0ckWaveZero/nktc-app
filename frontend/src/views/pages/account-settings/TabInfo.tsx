// ** MUI Imports
import CardContent from '@mui/material/CardContent';
import {
  Grid,
  Radio,
  Select,
  Button,
  MenuItem,
  TextField,
  FormLabel,
  InputLabel,
  RadioGroup,
  FormControl,
  OutlinedInput,
  FormControlLabel,
} from '@mui/material';

const TabInfo = () => {
  return (
    <CardContent>
      <form>
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ mt: 4.8 }}>
            <TextField
              fullWidth
              multiline
              label='Bio'
              minRows={2}
              placeholder='Bio'
              defaultValue='The name’s John Deo. I am a tireless seeker of knowledge, occasional purveyor of wisdom and also, coincidentally, a graphic designer. Algolia helps businesses across industries quickly create relevant 😎, scalable 😀, and lightning 😍 fast search and discovery experiences.'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type='number' label='Phone' placeholder='(012) 3456-7890' />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Website'
              placeholder='https://example.com/'
              defaultValue='https://themeselection.com/'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select label='Country' defaultValue='USA'>
                <MenuItem value='USA'>USA</MenuItem>
                <MenuItem value='UK'>UK</MenuItem>
                <MenuItem value='Australia'>Australia</MenuItem>
                <MenuItem value='Germany'>Germany</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id='form-layouts-separator-multiple-select-label'>Languages</InputLabel>
              <Select
                multiple
                defaultValue={['English']}
                id='account-settings-multiple-select'
                labelId='account-settings-multiple-select-label'
                input={<OutlinedInput label='Languages' id='select-multiple-language' />}
              >
                <MenuItem value='English'>English</MenuItem>
                <MenuItem value='French'>French</MenuItem>
                <MenuItem value='Spanish'>Spanish</MenuItem>
                <MenuItem value='Portuguese'>Portuguese</MenuItem>
                <MenuItem value='Italian'>Italian</MenuItem>
                <MenuItem value='German'>German</MenuItem>
                <MenuItem value='Arabic'>Arabic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel sx={{ fontSize: '0.875rem' }}>Gender</FormLabel>
              <RadioGroup row defaultValue='male' aria-label='gender' name='account-settings-info-radio'>
                <FormControlLabel value='male' label='Male' control={<Radio />} />
                <FormControlLabel value='female' label='Female' control={<Radio />} />
                <FormControlLabel value='other' label='Other' control={<Radio />} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant='contained' sx={{ mr: 3.5 }}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary'>
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  );
};

export default TabInfo;
