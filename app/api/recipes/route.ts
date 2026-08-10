import { NextRequest, NextResponse } from "next/server";
import { createRecipe, getAllRecipes } from "@/lib/recipes";

export async function GET() {
  try {
    const recipes = await getAllRecipes();
    return NextResponse.json({ recipes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load recipes." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const recipe = await createRecipe(body);
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unable to create recipe.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
