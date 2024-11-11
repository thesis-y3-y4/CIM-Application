import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff',
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  smallIcons: {
    marginRight: 10,
    fontSize: 24,
    color: 'green',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 260,
    height: 260,
    marginTop: 30,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 15,
    paddingBottom: 3,
    paddingTop: 14,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: '#23282B',
    borderRadius: 50,
  },
  textInput: {
    fontSize: 18,
    flex: 1,
    paddingLeft: 10,
    color: 'black',
    marginTop: -12,
  },
  loginContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 20,
  },
  header: {
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  text_header: {
    color: 'darkgreen',
    fontWeight: 'bold',
    fontSize: 30,
    paddingLeft: 10,
  },
  button: {
    alignItems: 'center',
    marginTop: -5,
    alignItems: 'center',
    textAlign: 'center',
    margin: 20,
  },
  inBut: {
    width: '70%',
    backgroundColor: 'darkgreen',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 50,
  },
  inBut2: {
    backgroundColor: '#420475',
    height: 65,
    width: 65,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallIcon2: {
    fontSize: 40,
  },
  bottomText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  radioButton_div: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioButton_inner_div: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton_title: {
    fontSize: 20,
    color: '#420475',
  },
  radioButton_text: {
    fontSize: 16,
    color: 'black',
  },
});
export default styles;
