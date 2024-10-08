import { Button } from "@/components/ui/button";
import { HomeIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="home">
      <div className="home_inner p-4 md:p-0"> {/* Added padding for mobile */}
        <h1 className="home_inner_title">
          Rejoignez 
          <span className="home_inner_title_colored"> les GOAT OF WE3</span>  <br/>et accédez à ce que les <br/>
          <span className="home_inner_title_colored"> autres ne voient pas.</span>
        </h1>
        <p className="home_inner_description">
          Non, vous ne rêvez pas. <br/>
          Vous avez l'opportunité unique de faire partie des GOW3.
        </p>
        <div className="home_inner_links">
          <Link href="mint" className="mr-5">
            <Button className="home_inner_links_button1 hover:bg-[#C8B1F4]">
              <HomeIcon className="mr-2" />Rejoignez-nous
            </Button>
          </Link>
          <div>Et</div>
          <Link href="club" className="ml-5">
            <Button className="home_inner_links_button2">
              <EyeOpenIcon className="mr-2" />Vous verrez
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}