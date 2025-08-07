import PageHeaders from "./components/PageHeaders";
import UploadIcon from "./components/UploadIcon";
import UploadForm from "./components/UploadForm";
import DemoSection from "./components/DemoSection";
export default function Home() {



  return (
    <>
      <PageHeaders 
        h1Text={'Add Ultimate Captions to your Videos'}
        h2Text={'Upload your Video and see the Magic'}
      />
      <div className="text-center">
        <UploadForm />
      </div>
     <DemoSection />
    </>
  );
}
