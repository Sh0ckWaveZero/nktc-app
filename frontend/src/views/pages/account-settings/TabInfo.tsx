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

// ** Form Imports
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

const schema = z.object({
  bio: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('รูปแบบ URL ไม่ถูกต้อง').optional().or(z.literal('')),
  country: z.string().min(1, 'กรุณาเลือกประเทศ'),
  languages: z.array(z.string()).min(1, 'กรุณาเลือกภาษาอย่างน้อย 1 ภาษา'),
  gender: z.string().min(1, 'กรุณาเลือกเพศ'),
});

type FormData = z.infer<typeof schema>;

const TabInfo = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      bio: "The name's John Deo. I am a tireless seeker of knowledge, occasional purveyor of wisdom and also, coincidentally, a graphic designer. Algolia helps businesses across industries quickly create relevant 😎, scalable 😀, and lightning 😍 fast search and discovery experiences.",
      phone: '',
      website: 'https://themeselection.com/',
      country: 'USA',
      languages: ['English'],
      gender: 'male',
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form data:', data);
      toast.success('บันทึกการเปลี่ยนแปลงสำเร็จ');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };
  return (
    <CardContent>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={7}>
          <Grid sx={{ mt: 4.8 }} size={12}>
            <Controller
              name='bio'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  label='Bio'
                  minRows={2}
                  placeholder='Bio'
                  error={!!errors.bio}
                  helperText={errors.bio?.message}
                />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Controller
              name='phone'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='number'
                  label='Phone'
                  placeholder='(012) 3456-7890'
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Controller
              name='website'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Website'
                  placeholder='https://example.com/'
                  error={!!errors.website}
                  helperText={errors.website?.message}
                />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Controller
              name='country'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.country}>
                  <InputLabel>Country</InputLabel>
                  <Select {...field} label='Country'>
                    <MenuItem value='USA'>USA</MenuItem>
                    <MenuItem value='UK'>UK</MenuItem>
                    <MenuItem value='Australia'>Australia</MenuItem>
                    <MenuItem value='Germany'>Germany</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Controller
              name='languages'
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.languages}>
                  <InputLabel id='form-layouts-separator-multiple-select-label'>Languages</InputLabel>
                  <Select
                    {...field}
                    multiple
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
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <Controller
              name='gender'
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.gender}>
                  <FormLabel sx={{ fontSize: '0.875rem' }}>Gender</FormLabel>
                  <RadioGroup {...field} row aria-label='gender' name='account-settings-info-radio'>
                    <FormControlLabel value='male' label='Male' control={<Radio />} />
                    <FormControlLabel value='female' label='Female' control={<Radio />} />
                    <FormControlLabel value='other' label='Other' control={<Radio />} />
                  </RadioGroup>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={12}>
            <Button type='submit' variant='contained' sx={{ mr: 3.5 }}>
              Save Changes
            </Button>
            <Button type='button' variant='outlined' color='secondary' onClick={() => reset()}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  );
};

export default TabInfo;
